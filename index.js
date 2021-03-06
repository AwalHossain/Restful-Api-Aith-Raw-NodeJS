/*
*
===Primary file for the Api
*
*/

// Dependencies

const http = require('http');
const https = require('https')
const url = require('url');
const config = require('./lib/config')
var {StringDecoder} = require('string_decoder');
const fs = require('fs');
const _data = require('./lib/data')
const {handler} = require('./lib/handler');
const helpers = require('./lib/helpers');


console.log(handler.ping, "handler");
// testing
// @TODO delete this

// writing file 

// _data.create('test', 'newFile-2',{fizz: 'buzinng'}, function(err, data){
//   console.log(err, "if not",data );
// })


// updating file
// _data.update('test', 'newFile',{fizz: 'buzinng'}, function(err, data){
//   console.log(err, "if not",data );
// })

// deleting file 

_data.delete('test', 'newFile-2', function(err){
    // console.log(er);
    if(!err){
      console.log("File deleted successfully");
    }else{
      console.log("error got me", err);
    }
})



// let httpsServerOption = {
//    'cert':fs.readFileSync('./https/cert.pem'),
//    'key': fs.readFileSync('./https/key.pem')
// }

let httpServer = http.createServer((req,res)=>{

  unified(req, res);
});


// let httpsServer = https.createServer(httpsServerOption,(req,res)=>{

//   unified(req, res);
// });
// server.on('request' , )

// http serveer instantiate 

httpServer.listen(config.httpPort, ()=>{
console.log("the serving is running on "+config.httpPort+" ");
})

// https server instantiate


// httpsServer.listen(config.httpsPort, ()=>{
// console.log("the serving is running on "+config.httpsPort+" ");
// })



// all the server logic for both http & https

let unified = function(req, res){

 // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var queryStringObject = parsedUrl.query;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');
console.log(trimmedPath, "path");
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
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath]: handler.notFound;
      
      console.log(chosenHandler,"ho");
      // construct the data object to send to the handler
      var data ={
        'trimmedPath': trimmedPath,
        'queryStringObject': queryStringObject,
        'method': method,
        'payload': helpers.parseJsonToObjec(buffer),
        'headers': headers
      }

      chosenHandler(data, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number'? statusCode:200;
        
        // use the payload returned from the handler 
        payload = typeof(payload) == 'object' ? payload : {};
        console.log(payload,"paylo");

        // convert the paylaod to a string 

        var paylaodString = JSON.stringify(payload);

        // send the response
        res.setHeader('Content-Type', "application/json")
        res.writeHead(statusCode).end(paylaodString)


      })





    })



}




// define the request router 

var router = {
  "ping": handler.ping,
  "users": handler.user,
  "token": handler.token,
  "checks":handler.check,
  
}


