/**
 * Request Handler
 */


// dependencies







// handler request
var handler = {

}


// ping handler
handler.ping = function(data, callBack){
  callBack(200,{"data":"Ping active still"})
}

handler.notFound = function(data, callBack){
  callBack(404,{"error":"Sorry it's not found"})
}


module.exports = {
    handler
}