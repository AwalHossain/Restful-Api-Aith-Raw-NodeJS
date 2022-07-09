
// Dependencies

const http = require('http');
const url = require('url')
const PORT = 5000;
const { StringDecoder } = require('string_decoder')





const server = http.createServer((req, res) => {

    unified(req, res)

});





server.listen(PORT, () => {
    console.log(`Server is listenning throug ${PORT}`);
})



// reqest container 

const unified = function (req, res) {

    const parsedUrl = url.parse(req.url);
    const queryStringObject = parsedUrl.query;
    const pathName = parsedUrl.pathname;
    const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');
    const method = req.method;
    const headers = req.headers;
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data)
    })


    req.on('end', () => {

        buffer += decoder.end();

        const checkPath = typeof (router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handler.notFound;
        const data = {
            "trimmedPath": trimmedPath,
            "queryStringObject": queryStringObject,
            "method": method,
            "headers": headers

        }
        // console.log(handler.notFound(),"path");

        checkPath(data, function (statusCode, paylaod) {


            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            paylaod = typeof (paylaod) === 'object' ? paylaod : {};

            const strinObject = JSON.stringify(paylaod);

            res.writeHead(statusCode).end(strinObject)

        })


    })


}


const handler = {};

handler.sample = function (data, callBack) {

    callBack(200, { 'stat': "Yes, You made it" })
}
handler.notFound = function (data, callBack) {
    callBack(500, { 'stat': "Yes, You madesssss it" })
}

const router = {
    "sample": handler.sample,
    "not": handler.notFound,
}