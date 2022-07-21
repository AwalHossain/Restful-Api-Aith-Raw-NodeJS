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

  console.log(firstName, lastName, phone, password, tosagreement, data.payload);

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
              console.log(err);
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
    console.log(phone,"jj");
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


module.exports = {
  handler
}