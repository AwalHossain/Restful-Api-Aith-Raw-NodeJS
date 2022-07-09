/**
 * Request Handler
 */


// dependencies
const _data = require('./data') 






// handler request
var handler = {

}


// users

handler.user = function(data, callBack){
  const acceptableMethods = ['post','get', 'put', 'delete'];

  if(acceptableMethods.indexOf(data.method)> - 1){
    handler._users[data.method](data, callBack)
  }
}


// container for all the users method

handler._users = {};

handler._users.post = function(data, callBack){
  // check all the required fields are filled
  let firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim(): false;
  
  let lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim(): false;
  
  let phone = typeof (data.payload.phone) === 'number' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false; 

  let tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement== true ? true : false; 

  if(firstName && lastName && phone && tosAgreement){
    // make sure the doesn't already exist
    _data.read('users', phone, function(err, data){
      if(err){

      }else{
        callBack(400,{'Error':"A user with that phone is already exist"})
      }
    })
  }
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