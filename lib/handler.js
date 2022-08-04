/**
 * Request Handler
 */


// dependencies
const _data = require('./data')
const helpers = require('./helpers');
const config = require('./config');





// handler request
var handler = {

}


/***
 * HTML Handler
 */

// index handler

handler.index = (data, callBack)=>{
  // Reject any request that isn't a GET 
  if(data.method === 'get'){

// Prepare data for interpolation 
var templateData = {
  'head.title' : 'This is the title',
  'head.description' : 'This is the meta description',
  'body.title' : 'Hello templated world!',
  'body.class' : 'index'
};

    // read in a template as a string
    helpers.getTemplate('index',templateData, (err, str)=>{
      
      console.log(str, "ilao");
      if(!err && str){

        // add the universal header and footer 
        helpers.addUniversalTemplates(str, templateData, (err, str)=>{
          if(!err && str){
            // return that page as HTML
            callBack(200, str, "html");
          }else{
              callBack(500, undefined,"html")
          }
        })
      }else{
        callBack(500, undefined, 'html')
      }
    })  
  }else{
    callBack(405, undefined)
  }
}


/**
 * 
 * JSON API hadler
 * 
 */



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

  let tosagreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;


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

        } else {
          callBack(500, { 'error': "Couldn't create hash passwod " })
        }
      } else {
        callBack(400, { 'Error': "A user with that phone is already exist" })
      }
    })
  } else {
    callBack(400, { 'error': "Pleas fill all the form correctly" })
  }

}




// users get method

handler._users.get = function (data, callBack) {

  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone : false;

  if (phone) {

    // get token from the headers

    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

    handler._tokens.verifyToken(token, phone, (tokenIsValied) => {
      if (tokenIsValied) {
        // look up the user
       
        _data.read('users', phone, function (err, data) {
          if (!err && data) {

            // remove the hashed password from the user
            delete data.hashPass;

            callBack(200, data);
          } else {
            callBack(404, { "err": "couldn't read data" })
          }
        })
      } else {
        callBack(400, { "err": "Missing required token in" })
      }
    })

    // lookup the user


  } else {
    callBack(400, { "err": "Put the right number" })
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

handler._users.put = function (data, callBack) {


  // check the required field

  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // optional checker

  // Check for optional fields
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone) {

    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

    handler._tokens.verifyToken(token, phone, (tokenIsValied) => {
      if (tokenIsValied) {

        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {

            // update the data if necessary
            if (firstName) {
              userData.firstName = firstName
            }
            if (lastName) {
              userData.lastName = lastName
            }
            if (password) {
              userData.hashPass = helpers.hash(password);
            }

            // store the new update
            _data.update('users', phone, userData, (err) => {
              if (!err) {
                callBack(200, { "success": "update sucessfully" });
              } else {
                callBack(500, { "err": "Couldn't update the user" })
              }
            })


          } else {
            callBack(400, { "err": "user data not available" })
          }
        })


      } else {
        callBack(400, { "err": "Put the right number" })
      }
    })

  } else {
    callBack(404, { 'err': "phone number is not valid" })
  }

}


// Delete method

handler._users.delete = function (data, callBack) {

  // check the phone number
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone : false;
  if (phone) {

    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

    handler._tokens.verifyToken(token, phone, (tokenIsValied) => {
      if (tokenIsValied) {

        // lookup the user
        _data.read('users', phone, function (err, data) {
          if (!err && data) {

            // remove the hashed password from the user
            _data.delete('users', phone, (err) => {
              if (!err) {



                var userChecks = typeof(data.checks) == 'object' && data.checks instanceof Array ? data.checks : [];
                let checksToDelete = userChecks.length;

                if(checksToDelete>0){
                  let totalDelete = 0;
                  let deletetionError = false;
                  userChecks.forEach( (checkId)=>{

                    _data.delete('checks', checkId, (err)=>{
                      if(err){
                        deletetionError = true;
                      }
                      totalDelete +=1;

                      if(totalDelete === checksToDelete){
                        if(!deletetionError){
                          callBack(200,{"msg": "All deletion has been successful"})
                        }else{
                          callBack(500, {"err": "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully."} )
                        }
                      }
                    })
                  } )
                }else{
                  callBack(200, { "success": "You file is deleted" })
                }

             

                
              } else {
                callBack(500, { "err": "Couldn't delete the file cause internal problem" })
              }
            })
          } else {
            callBack(404, { "err": "There was something wrong" })
          }
        })

      } else {
        callBack(400, { "err": "Token is invalid" })
      }
    })




  } else {
    callBack(400, { "err": "Put the right number" })
  }

}


handler.token = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handler._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handler._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handler._tokens.post = function (data, callback) {
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

 
  if (phone && password) {
    // Lookup the user who matches that phone number
    _data.read('users', phone, function (err, userData) {
      if (!err && userData) {
        // Hash the sent password, and compare it to the password stored in the user object
        var hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashPass) {
          // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          // Store the token
          _data.create('tokens', tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create the new token' });
            }
          });
        } else {
          callback(400, { 'Error': 'Password did not match the specified user\'s stored password' });
        }
      } else {
        callback(400, { 'Error': 'Could not find the specified user.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field(s).' })
  }
};


// Token - get method
// Required - token/id
handler._tokens.get = function (data, callBack) {
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id : false;

  if (id) {
    // lookup the tokens
    _data.read('tokens', id, function (err, data) {
      if (!err && data) {

        callBack(200, data);
      } else {
        callBack(404, { 'err': "error to fetch data" })
      }
    })

  } else {
    callBack(400, { "err": "Put the right number" })
  }
}


// Token - Put method

handler._tokens.put = function (data, callBack) {

  // check the required field

  let id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

  let extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === true ? data.payload.extend : false;

  if (id && extend) {

    // lookup the token
    _data.read('tokens', id, (err, userData) => {
      if (!err && userData) {
        if (userData.expires > Date.now()) {

          userData.expires = Date.now() + 1000 * 60 * 60 * 60
          // update the token expire date


          _data.update("tokens", id, userData, (err) => {
            if (!err) {
              callBack(200, userData)
            } else {
              callBack(500, { "err": "Coudn't extend the token expires date" })
            }
          })
        } else {
          callBack(403, { "err": "Token is expired" })
        }
      } else {
        callBack(400, { "err": "Couldn't read the file" })
      }
    })

  } else {
    callBack(400, { "err": "id or extend is not valid" })
  }

}





// Token - Delete method
// Required - id


handler._tokens.delete = function (data, callBack) {


  // check the phone number
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id : false;

  if (id) {
    // lookup the token
    _data.read('tokens', id, function (err, data) {
      if (!err && data) {

        // remove the hashed password from the user
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callBack(200, { "success": "Your token is deleted" })
          } else {
            callBack(500, { "err": "Couldn't delete the file cause internal problem" })
          }
        })
      } else {
        callBack(404, { "err": "There was something wrong" })
      }
    })

  } else {
    callBack(400, { "err": "Put the right token" })
  }
}



handler._tokens.verifyToken = function (id, phone, callBack) {

  // token
  _data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
    

      // check that token is for the given user and has not expired

      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callBack(true)
      } else {
        callBack(false,{"err":"token is expired"})
      }

    } else {
      callBack(false)
    }
  })
}



// checks properties

handler.check = function (data, callBack) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.indexOf(data.method) > - 1) {
    handler._checks[data.method](data, callBack)
  }
}

handler._checks = {};

/**
 * Checks - Post
 * Required data: Protocol, methdod, succesCodes, timeoutSecods
 * 
 */
handler._checks.post = function (data, callBack) {

  const protocol = typeof (data.payload.protocol) === 'string' && ["http", "https"].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false;
  var method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;

  const succesCodes = typeof (data.payload.succesCodes) === 'object' && data.payload.succesCodes instanceof Array && data.payload.succesCodes.length > 0 ? data.payload.succesCodes : false;

  const timeoutSecods = typeof (data.payload.timeoutSecods) === 'number' && data.payload.timeoutSecods % 1 === 0 && data.payload.timeoutSecods >= 1 ? data.payload.timeoutSecods : false;


  if (protocol && url && succesCodes && timeoutSecods) {

    // get the token from the headers
    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        let userPhone = tokenData.phone;

        // look-up the user
        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            let userChecks = typeof (userData.checks) === "object" && userData.checks instanceof Array ? userData.checks : [];

            // verify that user has less than the number per user
            if (userChecks.length < config.maxChecks) {
              // Create a random id for check
              let checkId = helpers.createRandomString(20);

              // create check object including userPhone
              let checkObject = {
                "id": checkId,
                "userPhone": userPhone,
                "protocol": protocol,
                "url": url,
                "method": method,
                "successCodes": succesCodes,
                "timeoutSecods": timeoutSecods
              }

              // save the object

              _data.create("checks", checkId, checkObject, (err) => {
                if (!err) {

                  // Add check id to the users object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // Save the data about new check
                  _data.update('users', userPhone, userData, (err) => {
                    if (!err) {
                      callBack(200, checkObject);
                    } else {
                      callBack(500, { "err": "Coudnt update the checks" })
                    }
                  })
                } else {
                  callBack(500, { "err": "couldn't create the checks" })
                }
              })
            } else {
              callBack(400, { "err": "User exceeds the maximum number of checks" })
            }
          } else
            callBack(403, { "err": "Your are forbidden to acess the data" })
        })
      } else {
        callBack(400, { "err": "couldn't token data" })
      }
    })

  } else {
    callBack(400, { "err": "Missing required field or required field is invalid" })
  }


}


/**
 * checks - get
 * required data: id
 */

handler._checks.get = function(data, callBack){
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id : false;


  if(id){

    _data.read('checks', id, (err, checkData)=>{
      if(!err && checkData){

        let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

        // verifying token
        handler._tokens.verifyToken(token, checkData.userPhone, (tokenIsValied) => {

          if (tokenIsValied) {
              
            // return the check data
            callBack(200, checkData);
           }else{
            callBack(403,{"err":"token is not valid"})
           }
          
          })
      }else{
        callBack(400,{"err":"error while reading data"})
      }
    })


  
  }else{
    callBack(400,{"err":"Required field missings"})
  }

}


/**
 * checks- put method
 * required - some of the fields that i used in post method
 */

handler._checks.put = function(data, callBack){


// CHECK REQUIRED FIELD
  let id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  
  // CHECK OPTIONAL FIELD
  const protocol = typeof (data.payload.protocol) === 'string' && ["http", "https"].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false;
  var method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;

  const succesCodes = typeof (data.payload.succesCodes) === 'object' && data.payload.succesCodes instanceof Array && data.payload.succesCodes.length > 0 ? data.payload.succesCodes : false;

  const timeoutSecods = typeof (data.payload.timeoutSecods) === 'number' && data.payload.timeoutSecods % 1 === 0 && data.payload.timeoutSecods >= 1 ? data.payload.timeoutSecods : false;


  if(id){

    _data.read('checks', id, (err, checkData)=>{
      if(!err && checkData){

        let token =  typeof (data.headers.token) === 'string' ? data.headers.token : false;

        handler._tokens.verifyToken(token, checkData.userPhone, (tokenIsValied)=>{
          if(tokenIsValied){
             // Update check data where necessary
             if(protocol){
              checkData.protocol = protocol;
            }
            if(url){
              checkData.url = url;
            }
            if(method){
              checkData.method = method;
            }
            if(succesCodes){
              checkData.successCodes = succesCodes;
            }
            if(timeoutSecods){
              checkData.timeoutSecods = timeoutSecods;
            }

            _data.update('checks', id, checkData, (err)=>{
              if(!err){
                callBack(200, {"msg":"data updated"})
              }else{
                callBack(500, {"msg":"error while updating"})
              }
            })

          }else{
            callBack(400, {"err":"Token is not valid"})
          }
        })



      }else{
        callBack(400,{"err":"couldn't read the check Data"})
      }
    })

  }else{
    callBack(400,{"err":"missing id"})
  }
}



/**
 * checkd = Delete method
 * required - id
 */

handler._checks.delete = (data, callBack)=>{
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id : false;

  if(id){
          // lookup the token
    _data.read('checks', id, function (err, userData) {
      if (!err && userData) {

        let token =  typeof (data.headers.token) === 'string' ? data.headers.token : false;

        handler._tokens.verifyToken(token, userData.userPhone, (tokenIsValied)=>{ 
          if(tokenIsValied){

            _data.delete('checks', id, (err)=>{
              if(!err){
            // lookup the user's object to get all their checks

                _data.read('users', userData.userPhone, (err, checkData)=>{
                  if(!err && checkData){

                    var userChecks = typeof(checkData.checks) == 'object' && checkData.checks instanceof Array ? checkData.checks : [];

                    let checkPosition = userChecks.indexOf(id) ;
                    
                    if(checkPosition > -1){
                      userChecks.splice(checkPosition, 1 );
                    // Re-save the user's data

                    checkData.checks = userChecks;

                    _data.update('users', userData.userPhone,checkData, (err)=>{
                      if(!err){
                        callBack(200, {"err":"data delete and update sucessfully"})
                      }else{
                        callBack(500, {"err":"couldn't update the data"})
                      }
                    })
                   }else{
                    callBack(500, {"err":"couldn't find the check on ther user object"})
                   }


                  }else{
                    callBack(400, {"err":"coudn't read the users data"})
                  }
                } )


              }else{
                callBack(500,{"err":"couldn't delete the check"})
              }
            })


          }else{
            callBack(403,{"err":"Token is not valid"})
          }
        })  


     
      } else {
        callBack(404, { "err": "There was something wrong" })
      }
    })
  }else{
    callBack(400,{"err":"id is not correct"})
  }
}



module.exports = {
  handler
}