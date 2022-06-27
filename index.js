/*
*
===Primary file for the Api
*
*/

// Dependencies
const http = require('http');
const url = require('url');



const server = http.createServer();

server.on('request' , (req,res)=>{
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,"");
    console.log(trimmedPath,"ul");
    res.end("Sever is started with raw nodejs");
})


server.listen(5000, ()=>{
console.log("the serving is running on...");
})