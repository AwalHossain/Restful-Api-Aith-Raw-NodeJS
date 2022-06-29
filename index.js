/*
*
===Primary file for the Api
*
*/

// Dependencies

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


    // get the headers as an object
    var headers = req.headers;

  console.log(headers , "pars");
  // Send the response
  res.end('Hello World!\n');

  // Log the request/response
  // console.log(`so the headers is ${headers}`);
});

// server.on('request' , )


server.listen(3000, ()=>{
console.log("the serving is running on...");
})