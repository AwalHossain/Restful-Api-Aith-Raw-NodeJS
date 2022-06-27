/*
*
===Primary file for the Api
*
*/

// Dependencies
"use strict"

const http = require('http');
const url = require('url');



const server = http.createServer((req,res)=>{
 // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

//   get the http method

    var method = req.method.toLowerCase();


  // Send the response
  res.end('Hello World!\n');

  // Log the request/response
  console.log('Request received on path: '+trimmedPath+ " method "+method);
});

// server.on('request' , )


server.listen(5000, ()=>{
console.log("the serving is running on...");
})