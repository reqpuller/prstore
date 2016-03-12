In this tutorial, you'll create a general-purpose container for key-value pairs and their associated metadata to provide a table where the data can be collected, consulted, modified, and discarded in a generic fashion with built-in <a href="http://jtable.org" title="jtable">jTable</a> functionality. To develop the app, you'll use Node.js, Express, Apache CouchDB, <a href="https://ace.ng.bluemix.net/#/store/fromCatalog=true&serviceOfferingGuid=14c83ad2-6fd4-439a-8c3a-d1a20f8a2381" title="Cloudant">Cloudant</a>, Nano, jTable, and <a href="https://developer.ibm.com/sso/bmregistration?lang=en_US&ca=dw-_-bluemix-_-wa-storeall-app-_-article" title="Bluemix">IBM® Bluemix™</a>. I also show you how to position masked or hidden table data so you can copy it to the clipboard through Ajax code.

<h2>What you'll need for your application</h2>

<ul>
	<li>
Intermediate web development skills</li>
	<li>
A Node.js and Express environment</li>
	<li>
<a href="https://developer.ibm.com/sso/bmregistration?lang=en_US&ca=dw-_-bluemix-_-wa-storeall-app-_-article"" title="Bluemix">Bluemix</a> and <a href="https://hub.jazz.net/?utm_source=dw&utm_campaign=bluemix&utm_content=wa-storeall-app&utm_medium=article&cm_mc_uid=84384525905314545849617&cm_mc_sid_50200000=1457021013" title="IBM DevOps Services">IBM DevOps Services</a> accounts that are associated with your IBM ID</li>
	<li>
The Cloud Foundry <a href="https://console.ng.bluemix.net/docs/#starters/BuildingWeb.html#install_cf" title="Cloud Foundry">command line tools</a></li>
</ul>

<h2>Step 1. Explore the application's UI</h2>


The UI elements that I circled in this screen capture control the various features of the table:
Screen capture of the Storeall Table app, a general purpose storage container
Clockwise from the upper-left corner, these elements are:
Sort button next to the Item field. Clicking the button sorts the data in ascending or descending order.
Value field. A string of * characters in this field means that the value is not visible. You can make the value visible by editing the item and setting it as visible.
+Add new item button. Clicking it opens a form to input a new item along with its metadata.
Edit Record icon. Clicking it opens a form so you can edit the current item.
Delete icon. Clicking it opens a dialog box to confirm the deletion of the item.
Table stats field. When the table contains items, Showing x-y of z is displayed in the lower-right corner of the table. The x and y values represent the lower and upper indexes of items that are shown in the table, and z represents the total number of items available in the database).
Row count drop-down list, which controls the number of items to display per page.
Go to page drop-down list — a random-access page selector.
<<, <, >, >>. First, last, next, and previous page selectors.
Here's the Add new item form for inserting a new item:
<ul>
	<li>
Screen capture of the 'Add new item' form</li>
	<li>
The fields in this form are:
<ul>
<li>
Item Name: The name of the item.</li>
	<li>
Value: The item value.</li>
	<li>
Value is visible radio button: Default is no.</li>
	<li>
Expiration Date. Date when the item is automatically deleted. (Not implemented.)</li>
	<li>
Usage drop-down list. Choices are paste (the default) and launch.</li>
	<li>
Command. (Optional, not used in the sample application.)</li>
</ul>
</ul>

<h3>Remarks.</h3>

This screen capture shows a selected row. The values that are captured in the Add new item form are displayed except for values that are marked in the table code as not editable or not creatable:
Screen capture that shows the values for a new item
Click to see larger image
Any field in a selected row can be highlighted and copied. When no fields are highlighted, Ctrl+C places the value of the item in the clipboard, and you can paste it into the appropriate text area.

<h2>Step 2. Fork the project and deploy the app from IBM DevOps Services to Bluemix</h2>bbbbbb

If you want to build the application locally before you deploy it to Bluemix, skip this step and resume the tutorial at Step 3.
In this step, you'll automatically deploy an instance of the application from your own DevOps Services project to Bluemix.
Log in to DevOps Services.
Click Get the code in this tutorial (under "What you'll need for your application)." In the overview page of my DevOps Services project, click the EDIT CODE button and click the FORK menu button to create a new project under your own login ID. Enter a name for your project and select the Deploy to Bluemix check box. Leave the other check boxes unchanged.
Click Save.
When the fork operation is complete, edit your project's manifest.yml in the DevOps Services IDE to change the app name to the one that you chose:
<pre><code>
---
applications:
- name: storeall
  runtime: node.js
  memory: 512M
  instances: 1
  path: .
  services:
    - cloudant
</code></pre>
Commit your changes into the repository:
Click the Git icon (second from the top in the menu on the left), and then complete the next dialog box:
Enter a comment for the commit.
Select the Select All check box.
Click commit x files (where x is the number of changed files — 1 in this case).
When the commit operation is done, click SYNC.
From your OS command line, run this command to create an instance of the Bluemix Cloudant service with the name cloudant:
<pre><code>
cf cs cloudantNoSQLDB Shared cloudant</code></pre>
On the DevOps Services page for your project, click BUILD & DEPLOY: Screen capture of BUILD & DEPLOY detail
Click SIMPLE: Screen capture of the SIMPLE detail
Click to see larger image
Wait a few minutes until the deployment is complete. You know that it is finished when the Deploy to field contains the short name of the application along with the URL of the deployed app: Screen capture of completed deployment with app short name and deployed URL
Click to see larger image
Click the URL in the Deploy to field to launch the application in your browser.
You're done with the deployment. If you want to build the application locally also, continue with Step 3. Otherwise, skip Steps 3 and 4, read Step 5 for information about the code, and skip Steps 6 and 7.

<h2>Step 3. Install CouchDB and Nano</h2>

Now you'll start to build the application locally. (If you want only the cloud-based version that you deployed in Step 2, skip to Step 5 for an explanation of the application code, and then skip Steps 6 and 7.)
Download the CouchDB binary for your OS from the CouchDB website and install it. (On Windows, accept the license terms and select to start the service automatically.)
Verify that CouchDB is installed successfully by querying the URL http://localhost:5984. The browser outputs the CouchDB version in a JSON string similar to:
{"couchdb":"Welcome","uuid":"b0b37363aa5915316dd45336dc46e4d5","version":"1.6.0","vendor":
{"version":"1.6.0","name":"The Apache Software Foundation"}}
From the command line, use npm to install the Node.js packages that are needed for CouchDB:
npm install -g couchdb
Install the Node.js packages for Nano:
npm install nano
<h2>Step 4. Import the application to your local file system</h2>

Click Get the code (under "What you'll need for your application").
In the DevOps Services repository, click EDIT CODE.
Select File > Export > Zip from the menu.
Click the created .zip file and extract it to a folder on your local disk named storeall.
<h2>Step 5. Examine the main files</h2>

Now you'll create an elementary CouchDB database in real time. The Storeall application is a general-purpose storage container where you can store key-value pairs by using a jTable table to drive create, read, update, and delete (CRUD) operations against the database.
<h3>Understanding the critical pieces of app.js</h3>

Begin by looking at the app.js file.
How Nano accesses CouchDB or Cloudant
If a credentials object is returned from processing the Bluemix environment variable, app.js uses the object's URL to bind Nano to the database. If no credentials object is returned, app.js knows that the code is on a local PC, so it interacts with CouchDB on port 5984, and it instructs Nano to interact with the database locally.
<pre><code>
if (creds!==undefined){
   nano=require('nano')(creds.url)
} else {
   nano = require('nano')('http://localhost:5984');
}  
 
nano.db.create('storeall');
var db = nano.db.use('storeall');
</code></pre>
Making the database object available to all the back-end requests
Every time that you send a request to access a page, you pass the Nano object that enables interaction with the database:
<pre><code>
app.use(function(req,res,next){
    req.db = db;
    next();
});
</code></pre>
<h3>Understanding the critical pieces of index.js</h3>

Next, look at the routes/index.js file.

<h4>The create function</h4>
In a CRUD operation, the create function is responsible for inserting new rows into the database. In NoSQL terminology, a row is a document. Using Nano, you issue an insert call after you set up the various fields that are based on the data that was collected by the jTable insert function:
<pre><code>
db.insert({itemname:itemname,itemvalue:itemvalue,itemremarks:itemremarks,itemdatecreated:
      itemdatecreated,itemdatemodified:itemdatemodified, itemusage:itemusage, itemvisible:itemvisible, 
      crazy: true }, itemname,function(err, body, header) {
      if (err) {
          retObj.Result="ERROR";
          retObj.Message="Could not create item or item already exists";
         
      } else {
          retObj.Result = "OK";
          retObj.Record=body;
      }
      res.send(json.stringify(retObj));
   });
});
</code></pre>
The Nano insert function takes a JSON object that contains the fields to be inserted, the field that is used as a key (itemname), and a callback function to receive control after the insert operation returns. Because most Node.js calls are asynchronous, you must pass in that callback function, which Node calls when the operation completes. The callback function takes three parameters:
An error string that is undefined if the operation succeeds
A body object that contains returned data
An object containing headers
If the insert call succeeds, a JSON object is returned to jTable, where the Result field is set as OK and the Record field contains the inserted data. If the call fails, the Result is set to ERROR and the Message field contains the error message.
The update function
The update function is basically the insert function with one critical difference. All updates must supply a revision number, which is how CouchDB implements concurrency. It increments the revision number each time an update is made. If the document is updated while another user tries to update it (that is, someone accesses and updates it after it is read), the revision number changes from the number of the current updater. CouchDB fails the update with the now-stale revision number. If that happens, a reread and data reconciliation are necessary.
The following call asks CouchDB to insert the document that is based on the itemname key along with the revision number:
<pre><code>
db.insert({itemname:itemname,itemvalue:itemvalue,itemremarks:itemremarks,itemdatecreated:
    itemdatecreated,itemdatemodified:itemdatemodified, itemexpiration:itemexpiration, itemusage:
    itemusage, itemvisible:itemvisible, crazy: true, _rev:rev }, itemname,function(err, body, header) {
              if (err) {
                  retObj.Result="ERROR";
                  retObj.Message="Error updating item...it was possibly updated by another user. 
                      Re-read it";
              } else {
                  retObj.Result = "OK";
                  retObj.Record=body;
              }
              res.send(json.stringify(retObj));
           });
       } else {
           retObj.Result="ERROR";
           retObj.Message="Item not found";
           res.send(json.stringify(retObj));
       }
   });
});
</code></pre>
The call relies on CouchDB to detect any revision conflicts. If the insert succeeds, CouchDB returns the new revision number in the body object. In this way, CouchDB itself is not updated. Each update is an insert of a new document with a new revision number.
The list function
The list function is basically the same as a read function and is responsible for supplying the data that is displayed in the jTable table. Through the query string, the list function receives the following information:
The parameter that specifies the sort order (ascending or descending) of the key column: jtSorting
The index at which to start displaying the documents: jtPageStartIndex
The number of items to display per page: jtPageSize
This code maps these parameters into values that the Nano list function (different from the application's list function) understands:
<pre><code>
router.post('/itemlist', function(req, res) {
    var sorting_desceding = true;
    //determine the sort order from the querystring
    if (req.query.jtSorting !== undefined){
       //Two possible values are ASC and DESC. If the last three characters of a value are ESC then 
       //we assume they passed DESC else default to ASC
       sorting_descending = (req.query.jtSorting.substring(req.query.jtSorting.length-3)==='ESC');
    }    
    var db = req.db
     //jtPageSize = number of items to display on the table
     //jtStartIndex is the first item to display on the table, we tell cloudant to skip   
     //x # of items so the start index
     //can be the index of the first item to display
     , params   = {include_docs: true, skip: req.query.jtStartIndex, limit: 
                req.query.jtPageSize, descending: sorting_descending};
     
    db.list(params, function(error,body,headers) {
         var docs = [];
       var row;
       for (row in body.rows){
           //the list functions displays all the databases along with the documents
           //so we extract the documents and send them to jtable
           //console.log('row text '+body.rows[row].id + ' and row=' + row);
          docs[row]=body.rows[row].doc;
       }
       var json_obj = {};
       json_obj.Result = "OK";
       json_obj.Records = docs;
       //adjust all the parameter that allows us to paginate the table
       json_obj.TotalRecordCount=body.total_rows;
       res.send(json.stringify(json_obj));
    
    });
    
});</code></pre>
You tell the Nano list function to return the documents with the include_docs parameter. By default, CouchDB does not return the documents but only the document keys.
So you extract these documents from the array that is returned by CouchDB and dispatch them back to jTable. You also include the total number of documents in the database, which enables jTable to do pagination.

<h3>Understanding the critical parts of jtable.jade</h3>

Jade is an HTML template processing language that is used to create HTML pages in realtime. I took the jQuery-based jTable Ajax code and fitted it into a Jade template. You need to include any JavaScript code as pure text in the template by adding the pipe character | as a prefix to each script line, accounting for any indentation before that character. The Jade template file is views/jtable.jade.
Links to CSS, jQuery, and jTable JavaScript files
<pre><code>
The jTable table requires several jQuery scripts, CSS files, and its own jTable and CSS files:
    link(rel='stylesheet', href='/stylesheets/style.css', type='text/css')
    link(href='/javascripts/jquery/jquery-ui-1.11.0/jquery-ui.css', rel='stylesheet', type='text/css')
    link(href='/javascripts/jtable.2.4.0/themes/metro/crimson/jtable.css', rel='stylesheet', 
        type='text/css')
    link(href='/javascripts/jtable.2.4.0/themes/jqueryui/jtable_jqueryui.css', rel='stylesheet', 
        type='text/css')
    script(src='/javascripts/jquery/jquery-1.11.1.js', type='text/javascript')
    script(src='/javascripts/jquery/jquery-ui-1.11.0/jquery-ui.js', type='text/javascript')
    script(src='/javascripts/jtable2.4.0/jquery.jtable.js', type='text/javascript')
The CRUD action links
The CRUD actions are handled by the following JavaScript code:
    |        actions: {
    |           listAction: '/itemlist',
    |           createAction:'/new_item',
    |           updateAction: '/update_item',
    |           deleteAction: '/delete_item'
    |               
    |        },
jTable posts to/itemlist, /new_item, /update_item, and /delete_item Node pages so that it can accomplish a specific CRUD action.
jTable fields and semantics
The following code specifies the behavior of particular fields or table columns:
    |           itemname: {
    |              title:'Item Name',
    |              key: true,
    |              list: true,
    |              create:true,
    |               edit: false    
    |           },
    |           itemvalue: {
    |              title: 'Value',
    |              width: '30%',
    |              list: true,
    |               display: function(data){
    |                  data.record.rev=data.record._rev;
    |                  if (data.record.itemvisible==='true'){
    |                      return data.record.itemvalue;
    |                  } else {
    |                      return "*********";
    |                  }
    |               },
    |              create: true
    |           },
    |           itemvisible: {
    |              title: 'Value is Visible',
    |              width: '30%',
    |              list: false,
    |              create: true,
    |               type: 'radiobutton',
    |               options: { 'true':'Yes', 'false':'No'},
    |               defaultValue: 'false'        
    |           },
    |         itemdatemodified: { 
    |              title: 'Date Modified',
    |              width: '30%',
    |              list: true,
    |              create: false,
    |            edit: false,
    |            display: function(data){
    |                 var date = new Date(data.record.itemdatemodified);
    |                 return date.getMonth() + 1 + '/' + date.getDate() + '/' +  date.getFullYear();
    |            }
    |           },
</code></pre>
For example, the itemname field is the key. It can be created and shown but cannot be edited. The itemvalue field can be created, shown, and edited. With the display function, you can do any transformation to a column before you display it.
Copying and pasting item values
The jTable display function is used to mask, by default, the value of items in the table. I provided code to copy that value to the clipboard. The technique that is used is from the Trello application and adapted to the needs of the jQuery-based jTable. The technique is:
Whenever a row on the table is selected, copy its value into a holding area accessible to the code that monitors copy operations:
<pre><code>
    |                copy(record,document);
Register handlers for Key down and Key up in the jTable UI:
    |    registerForKeyDownEvent(document,handleKeyDownEvent);
    |    registerForKeyUpEvent(document,handleKeyUpEvent);
When the user presses the Ctrl key, if no text areas are selected, create an invisible text area with the data copied in step 1, select that area, and set focus on it. The last line in the following code block creates the invisible text area:
    |    var keyDownEventHandler = function (e) {
    |      if (!(e.ctrlKey || e.metaKey)) {
    |          return;
    |      }
    |      if (window.getSelection && window.getSelection() && window.getSelection().toString()) {
    |          return;
    |      }
    |      if (document.selection && document.selection.createRange().text) {
    |          return;
    |      }
    |      setTimeout(SCTextArea, 0);
When the user releases the C key, if the target control is not the target text area, do nothing and the typical copy operation takes place. Otherwise, set the display status of the container to the text area to be invisible. Then, the typical OS copy operation is carried out on the invisible text:
    | var keyUpEventHandler = function (e) {
    |      var code = e.keyCode || e.which;
    |      if (e.target.id !== TAId) {
    |          return;
    |      }
    |      if (code!==67){
    |         return;
    |      }        
    |      enclosure.style.display = 'none';
    |    };</code></pre>
<h2>Step 6. Install and run the Storeall application locally</h2>

Change to the storeall folder.
Install the dependencies by running the command npm install command.
Run the Express web server that serves your application by running the npm start command.
Verify that your application started. If the application starts successfully, the following message is displayed: Express server listening on port 3000
Test your application by going to http://localhost:3000.
Add a couple of records. Select a record by clicking a row. Press Ctrl+C and verify that only the value of the record is pasted when you press Ctrl+V into an editor or a text area.

<h2>Step 7. Manually deploy your application to Bluemix</h2>


<h3>Create a Cloudant service instance:</h3>
 <pre><code>cf cs cloudantNoSQLDB Shared cloudant</code></pre>

Edit storeall\manifest.yml and change the name value:
<pre><code>
 ---
 applications:
 name: storeall
 runtime: node.js
 memory: 512M
 instances: 1
 path: .
 services:
 cloudant
</code></pre>
Push the application to Bluemix, replacing storeall-name in this command with the name you use in your manifest:
<pre><code>
 cf push storeall-name</code></pre>
When the deployment finishes and the application starts successfully, point your browser to http://yourappname.mybluemix.net. Click Add new item to start populating the table:
Screen capture of unpopulated Storeall Table

<h2>Conclusion</h2>

In this tutorial, I showed you how to install and use CouchDB and the Nano driver locally. You learned how to use the jQuery-based jTable Ajax package to drive CRUD operations against CouchDB and how to add special code to position masked table data to be copied to the clipboard. You also learned that, in many cases, the same code that drives a CouchDB database can drive a Cloudant database. You verified this Cloudant-CouchDB compatibility by deploying the application to Bluemix and accessing Cloudant without touching a single line of code that reads and writes to and from both CouchDB and Cloudant. You also learned how to code basic CouchDB concurrency with revision numbers to ensure that data is not inadvertently overwritten.