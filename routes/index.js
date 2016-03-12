var express = require('express');
var router = express.Router();
var app = require('../app');
var json = require('JSON');

var db = app.db;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('jtable', { title: 'Express' });
});
/* GET home page. */
router.get('/jtable', function(req, res) {
  res.render('jtable', { title: 'Express' });
});


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
     //jtStartIndex is the first item to display on the table, we tell cloudant to skip x # of items so the start index
     //can be the index of the first item to display
     , params   = {include_docs: true, skip: req.query.jtStartIndex, limit: req.query.jtPageSize, descending: sorting_descending}
     ;
     
    db.list(params, function(error,body,headers) {
        	var docs = [];
    	var row;
    	for (row in body.rows){
    	    //The list function displays all the databases along with the documents
    	    //so we extract the documents and send them to jtable
    	    console.log('row text '+body.rows[row].id + ' and row=' + row);
    		docs[row]=body.rows[row].doc;
    	}
    	var json_obj = {};
    	json_obj.Result = "OK";
    	json_obj.Records = docs;
    	//adjust all the parameter that allows us to paginate the table
    	json_obj.TotalRecordCount=body.total_rows;
    	res.send(json.stringify(json_obj));
    
    });
    
});

router.post('/new_item', function(req, res){
   //adding a new item (document) to the db
	var db = req.db;
	var itemname=req.body.itemname;
	var itemvalue=req.body.itemvalue;
	var itemremarks=req.body.itemremarks;
	var itemdatecreated=Date();
	var itemdatemodified=Date();
	var itemusage=req.body.itemusage;
	var itemcommand=req.body.itemcommand;
	var itemvisible=req.body.itemvisible;
	var itemexpiration=req.body.itemexpiration;
	if (itemexpiration===undefined){
	   itemexpiration=-1;
	}
	if (itemremarks===undefined){
	   itemremarks="";
	}
	
	if (itemcommand===undefined){
	   itemcommand="";
	}
	if (itemusage===undefined){
	   itemusage="";
	}
	var retObj = {};
	db.insert({itemname:itemname,itemvalue:itemvalue,itemremarks:itemremarks,itemdatecreated:itemdatecreated,itemdatemodified:itemdatemodified, itemusage:itemusage, itemvisible:itemvisible, crazy: true }, itemname,function(err, body, header) {
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

router.post('/update_item', function(req, res){
	var db = req.db;
	var itemname=req.body.itemname;
	var itemvalue=req.body.itemvalue;
	var itemremarks=req.body.itemremarks;
	var itemdatemodified=Date();
	var itemusage=req.body.itemusage;
	var itemcommand=req.body.itemcommand;
	var itemvisible=req.body.itemvisible;
	var itemexpiration=req.body.itemexpiration;
	var itemrevision=req.body.rev;
	var itemexpiration;
	if (itemremarks===undefined){
	   itemremarks="";
	}
	if (itemexpiration===undefined){
	   itemexpiration=-1;
	}
	
	if (itemcommand===undefined){
	   itemcommand="";
	}
	if (itemusage===undefined){
	   itemusage="";
	}
	var rev;
	var retObj = {};
	//Updating the item entails reading it and passing the revision number we're updating
	//if someone has updated the doc in the mean time the doc revision number will change
	//and our update will fail we have to re-read the document and adjust our update and
	//resubmit it with the new revision number. We don't retry here. The user has to
	//re-read thye item.
	db.get(req.body.itemname, { revs_info: true }, function(err, body) {
	    if (!err){
	        itemname=req.body.itemname;
	        rev = body._rev;
	        if (rev!==itemrevision){
	           retObj.Result="ERROR";
		       retObj.Message="Item has changed...please refresh your browser";
		       res.send(json.stringify(retObj));
	        }
	        itemdatecreated=body.itemdatecreated;
	        if (itemremarks===""){
	           itemremarks=body.itemremarks;
	        }
	        if (itemcommand===""){
	 		  itemcommand=body.itemcommand;
			}
			if (itemusage===""){
	   			itemusage=body.itemusage;
			}
		    db.insert({itemname:itemname,itemvalue:itemvalue,itemremarks:itemremarks,itemdatecreated:itemdatecreated,itemdatemodified:itemdatemodified, itemexpiration:itemexpiration, itemusage:itemusage, itemvisible:itemvisible, crazy: true, _rev:rev }, itemname,function(err, body, header) {
		        if (err) {
		            retObj.Result="ERROR";
		            retObj.Message="Error updating item...it was possibly updated by another user. Re-read it";			
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

router.post('/delete_item', function(req, res){
    var db = req.db;
    var retObj={};
	retObj.Result="OK";
	db.get(req.body.itemname, { revs_info: true }, function(err, body) {
	
		if (!err){
			db.destroy(req.body.itemname,body._rev , function(err, body) {
				if (err){
				    retObj.Result="ERROR";
				    //retObj.Message="Error during the deletion";
				    retObj.Message=err;
				}
			});
			res.send(json.stringify(retObj));;
		} else {
		   retObj.Result="ERROR"
		   retObj.Message=err;
		   res.send(json.stringify(retObj));
		}
	});
});
module.exports = router;

router.post('/nuke_item', function(req, res){
    var db = req.db;
    var retObj={};
	retObj.Result="OK";
	db.get(req.body.itemname, { revs_info: true }, function(err, body) {
	
		if (!err){
			db.destroy(req.body.itemname,body._rev , function(err, body) {
				if (err){
				    retObj.Result="ERROR";
				    //retObj.Message="Error during the deletion";
				    retObj.Message=err;
				}
			});
			res.send(json.stringify(retObj));;
		} else {
		   retObj.Result="ERROR"
		   retObj.Message=err;
		   res.send(json.stringify(retObj));
		}
	});
});
module.exports = router;
