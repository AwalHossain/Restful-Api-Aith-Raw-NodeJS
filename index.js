/*
*
===Primary file for the Api
*
*/

// Dependencies

const http = require('http');
const url = require('url');
var {StringDecoder} = require('string_decoder');


const server = http.createServer((req,res)=>{
 // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var queryStringObject = parsedUrl.query;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

//   get the http method

    var method = req.method.toLowerCase();
    var headers = req.headers;
    // get the payload, if any

    const decoder = new StringDecoder('utf-8');
    let buffer = '';



    req.on('data', function(data){
      buffer += decoder.write(data)
    })

    req.on('end', ()=>{

      buffer += decoder.end();
      
      // check the router for a matching path for a handler. If one is not found, use not found instead
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath]: handlers.notFound;

      // construct the data object to send to the handler
      var data ={
        'trimmedPath': trimmedPath,
        'queryStringObject': queryStringObject,
        'method': method,
        'payload': buffer,
        'headers': headers
      }

      chosenHandler(data, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number'? statusCode:200;
        
        // use the payload returned from the handler 
        payload = typeof(payload) == 'object' ? payload : {};

        // convert the paylaod to a string 

        var paylaodString = JSON.stringify(payload);

        // send the response
        res.writeHead(statusCode).end(paylaodString)


      })


    })



    // get the headers as an object
  // Log the request/response
  // console.log(`so the headers is ${headers}`);
});

// server.on('request' , )


server.listen(3000, ()=>{
console.log("the serving is running on...");
})


var handlers = {};

// sample handler

handlers.sample = function(data, callBack){

  callBack(200,{"name":"Sample handler"})
}

handlers.notFound = function(data, callBack){
  callBack(404);
}


// define the request router 

var router = {
  'sample': handlers.sample
}