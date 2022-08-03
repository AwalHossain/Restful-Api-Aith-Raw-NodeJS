// Dependencies

const http = require('http');
const https = require('https')
const url = require('url');
const config = require('./config')
var { StringDecoder } = require('string_decoder');
const fs = require('fs');
const _data = require('./data')
const { handler } = require('./handler');
const helpers = require('./helpers');
const lib = require('./data');
const util = require('util');
const debug = util.debuglog('server');


// helpers.sendTwilioSms("1627656375", "I was wondering", (err)=>{
//   debug(err,"oe");
// })

/** Instantiate the server module object */

let server = {};

// let httpsServerOption = {
//    'cert':fs.readFileSync('./https/cert.pem'),
//    'key': fs.readFileSync('./https/key.pem')
// }

/** Instantia the HTTP server */
server.httpServer = http.createServer((req, res) => {

    server.unifiedServer(req, res);
});


// let httpsServer = https.createServer(httpsServerOption,(req,res)=>{

//   unified(req, res);
// });
// server.on('request' , )

// http serveer instantiate 



// https server instantiate


// httpsServer.listen(config.httpsPort, ()=>{
// debug("the serving is running on "+config.httpsPort+" ");
// })



// all the server logic for both http & https
server.unifiedServer = function (req, res) {

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



    req.on('data', function (data) {
        buffer += decoder.write(data)
    })

    req.on('end', () => {

        buffer += decoder.end();


        // check the router for a matching path for a handler. If one is not found, use not found instead
        var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ?server.router[trimmedPath] : handler.notFound;

        // construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'payload': helpers.parseJsonToObjec(buffer),
            'headers': headers
        }

        chosenHandler(data, function (statusCode, payload) {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // use the payload returned from the handler 
            payload = typeof (payload) == 'object' ? payload : {};

            // convert the paylaod to a string 

            var paylaodString = JSON.stringify(payload);

            // send the response
            res.setHeader('Content-Type', "application/json")
            res.writeHead(statusCode).end(paylaodString)

            // if the response is 200, print green, otherwise print red
           console.log(statusCode,"Olao");
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+ " /"+ trimmedPath+ " "+ statusCode);
            }else{
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+" /" +trimmedPath+ " "+statusCode)
            }

        })

    })



}




// define the request router 

server.router = {
    "ping": handler.ping,
    "users": handler.user,
    "token": handler.token,
    "checks": handler.check,

}


/** Init script */

server.init = () => {

    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[31m%s\x1b[0m',"the serving is running on " + config.httpPort + " ");
    })
}





/** Export the module */


module.exports = server;