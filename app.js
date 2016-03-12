var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var env;
app.set('port', process.env.PORT || 3000);
if (process.env.VCAP_SERVICES !== undefined){
    //get the service JSON object
    env = JSON.parse(process.env.VCAP_SERVICES);
}

//if running on BlueMix get the credentials for the cloudant service
var creds = getEnv(env, "cloudantNoSQLDB");
var nano;
var nanoid;

/*include the nano module and link to either cloudant on BlueMix or the local couchdb*/
if (creds!==undefined){
	nano=require('nano')(creds.url)
} else {
   nano = require('nano')('http://localhost:5984');
}   
//create a db if one does not exist...if it exist an error is returned, we don't care
nano.db.create('storeall2');
var db = nano.db.use('storeall2');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});


app.use('/', routes);
app.use('/users', users);
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//retrieve the service environment JSON object
function getEnv(vcapEnv, service) {
   if (vcapEnv === undefined){
	   return vcapEnv;
   }
   for (var serviceOfferingName in vcapEnv) {
   	    if (vcapEnv.hasOwnProperty(serviceOfferingName) &&
   	    		serviceOfferingName.indexOf(service) === 0) {
   	    	var serviceBindingData = vcapEnv[serviceOfferingName][0];
   	    	return serviceBindingData.credentials;
   	    }
   }
}

var runport=3000;
runport=app.get('port');
http.createServer(app).listen(runport, function(){
console.log('Express server listening on port ' + runport);
});

module.exports = app;
