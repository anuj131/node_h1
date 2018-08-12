/**
 *
 * Primary file of the App
 * 
 */

// Dependency
var http = require('http');
var https = require('https');
var url = require('url');
var config = require('./config');
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;


// Instantiate the HTTP server
var httpServer = http.createServer(function (req,res) {
	unifiedServer(req,res);
});

// Start HTTP server
httpServer.listen(config.httpPort,function (req,res) {
	console.log('Node is listening on port '+config.httpPort+' in '+config.envName+' mode');
});

// Instantiate the HTTPS server
var httpsServerOptions = {
	'key' : fs.readFileSync('certs/key.pem'),
	'cert' : fs.readFileSync('certs/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function (req,res) {
	unifiedServer(req,res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort,function (req,res) {
	console.log('Node is listening on port '+config.httpsPort+' in '+config.envName+' mode');
});

// All the sever logic for both http and https servers
var unifiedServer = function(req,res) {
	// Get the url and parse it
	var parsedUrl = url.parse(req.url,true);

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as an object
	var queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	var method = req.method.toLowerCase();

	// Get the headers as an object
	var headers = req.headers;
	 
	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',function(data) {
		buffer += decoder.write(data);
	});

	req.on('end',function () {
		buffer += decoder.end();

		// Choose the handler this request should go to. If one is not found, use the notFound handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		// Route the request to the handler specified in the router
		chosenHandler(data,function (statusCode,payload) {
			// Use the status code called back by th handler,or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			// Use the payload call back to the handler, or default to empty object
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload to a string
			var payloadString = JSON.stringify(payload);

			// Send the response
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the request path
			console.log('Returning this response : ',statusCode,payloadString);
		});
	});
};

// Define handler
var handlers = {};

// Ping handler 
handlers.ping = function (data,callback) {
	// Callback a http status code, and a payload object
	callback(200);
};
// Ping handler 
handlers.hello = function (data,callback) {
	// Callback a http status code, and a payload object
	callback(200,{"Greeting":"Hello World"});
};

// Not found handler 
handlers.notFound = function (data,callback) {
	callback(404,{'Message':'Content not found'});
};

// Define a reqest router
var router = {
	'ping' : handlers.ping,
	'hello' : handlers.hello
};

