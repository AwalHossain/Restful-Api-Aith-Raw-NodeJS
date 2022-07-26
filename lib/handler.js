/**
 * Request Handler
 */


// dependencies
const _data = require('./data')
const helpers = require('./helpers')





// handler request
var handler = {

}


// users

handler.user = function (data, callBack) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.indexOf(data.method) > - 1) {
    handler._users[data.method](data, callBack)
  }
}


// container for all the users method

handler._users = {};


// post method

handler._users.post = function (data, callBack) {
  // check all the required fields are filled
  let firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  let lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;


  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  let tosagreement =typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;


  if (firstName && lastName && phone && tosagreement && password) {


    // make sure the doesn't already exist
    _data.read('users', phone, function (err, data) {
      if (err) {

        // hash the password
        const hashPass = helpers.hash(password)

        if (hashPass) {
          let userObj = {
            'firstName': firstName,
            'lastName': lastName,
            "password": password,
            'hashPass': hashPass,
            'tosagreement': true
          }
          // Store the user 
          _data.create('users', phone, userObj, function (err) {
            if (!err) {
              callBack(200);
            } else {
              callBack(500, { "error": "Couldn't create the new user" })
            }
          })

        }else{
          callBack(500, {'error': "Couldn't create hash passwod "})
        }
      } else {
        callBack(400, { 'Error': "A user with that phone is already exist" })
      }
    })
  }else{
    callBack(400, {'error':"Pleas fill all the form correctly"})
  }

}




// users get method

handler._users.get = function(data, callBack){

  const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone : false;
  if(phone){
    // lookup the user
    _data.read('users', phone, function(err, data){
      if(!err && data){

        // remove the hashed password from the user
        delete data.hashPass;

        callBack(200, data);
      }else{
        callBack(404)
      }
    })

  }else{
    callBack(400,{"err":"Put the right number"})
  }
}

// ping handler
handler.ping = function (data, callBack) {
  callBack(200, { "data": "Ping active still" })
}

handler.notFound = function (data, callBack) {
  callBack(404, { "error": "Sorry it's not found" })
}



// Put method to update user data

handler._users.put=function(data, callBack){


  // check the required field

  var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // optional checker

    // Check for optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(phone){

    _data.read('users', phone, (err, userData)=>{
      if(!err && userData){

        // update the data if necessary
        if(firstName){
          userData.firstName = firstName
        }
        if(lastName){
          userData.lastName = lastName
        }
        if(password){
          userData.hashPass = helpers.hash(password);
        }

        // store the new update
        _data.update('users',phone,userData,(err)=>{
          if(!err){
            callBack(200,{"success":"update sucessfully"});
          }else{
            callBack(500, {"err":"Couldn't update the user"})
          }
        })


      }else{
        callBack(400, {"err":"user data not available"})
      }
    })

  }else{
    callBack(404,{'err':"phone number is not valid"})
  }

}


// Delete method

handler._users.delete = function(data, callBack){

  // check the phone number
   const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone : false;
  if(phone){
    // lookup the user
    _data.read('users', phone, function(err, data){
      if(!err && data){

        // remove the hashed password from the user
        _data.delete('users', phone, (err)=>{
          if(!err){
            callBack(200, {"success":"You file is deleted"})
          }else{
            callBack(500, {"err":"Couldn't delete the file cause internal problem"})
          }
        })
      }else{
        callBack(404,{"err":"There was something wrong"})
      }
    })

  }else{
    callBack(400,{"err":"Put the right number"})
  }

}


handler.token = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handler._tokens[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handler._tokens  = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handler._tokens.post = function(data,callback){
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(phone && password){
    // Lookup the user who matches that phone number
    _data.read('users',phone,function(err,userData){
      if(!err && userData){
        // Hash the sent password, and compare it to the password stored in the user object
        var hashedPassword = helpers.hash(password);
        if(hashedPassword === userData.hashPass){
          // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
          };

          // Store the token
          _data.create('tokens',tokenId,tokenObject,function(err){
            if(!err){
              callback(200,tokenObject);
            } else {
              callback(500,{'Error' : 'Could not create the new token'});
            }
          });
        } else {
          callback(400,{'Error' : 'Password did not match the specified user\'s stored password'});
        }
      } else {
        callback(400,{'Error' : 'Could not find the specified user.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field(s).'})
  }
};




module.exports = {
  handler
}