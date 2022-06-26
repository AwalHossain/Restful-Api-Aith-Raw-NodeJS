const http = require('http');



const server = http.createServer();

server.on('request' , (req,res)=>{
    res.statusCode  = 200;
    res.setHeader('Content-type', "text/plain")
    res.end("hello htere");
})


server.listen(3000, ()=>{
console.log("the serving is running on...");
})