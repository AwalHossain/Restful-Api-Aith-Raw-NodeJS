/**
 * Helpers for various task
 */


// Dependencies

let config = require('./config');
let crypto = require('crypto');
let querystring = require('querystring');
var https = require('https');
const path = require('path');
const fs = require('fs');
// container for the helpers
let helpers = {}




// convert json to parse object

helpers.parseJsonToObjec = function(str){
    try{
        const obj = JSON.parse(str);
        return obj;
    }catch(err){
        return {}
    }
}

// create a sha256 hash

helpers.hash = function(str){
    if(typeof(str) === 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');

        return hash;
    }else{
        return false;
    }

}

helpers.createRandomString = function(strLength){
    strLength = typeof(strLength) === 'number' && strLength >0 ? strLength : false;
    if((strLength)){
    const possibleCharacter = "abcdefghijklmnopqrstwvxyz0123456789";
    let str = ""

    for(let i=0; i< strLength; i++){

        // get the random character from the possible character

        const randomCharacter = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length));

        str += randomCharacter;

    }

    return str; 
    }else{
        return false
    }
}

/**
 * sending sms through twilio api
 */

helpers.sendTwilioSms = function(phone, msg, callBack){
    // validate parameters
    phone = typeof(phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false;
    msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <=16000 ? msg.trim() : false;
    
    if( phone && msg ){
        // configure the requrest payload
        
        let paylaod = {
            "From": config.twilio.fromPhone,
            "To": "+880"+phone,
            "Body": msg
        }
        
        let stringPayload = querystring.stringify(paylaod);
        
        // configure the request details
        
        let requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
            'headers' : {
              'Content-Type' : 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(stringPayload)
            }
        }
        
        // instantiate the request object 
        let req = https.request(requestDetails, (res)=>{
            // Grab the status of the sent request
            
            let status = res.statusCode;
            
            // callBack successfully if the request went through
            
            if(status === 200 || status === 201 ){
                callBack(false);
            }else{
                callBack("Status code returened was"+status);
            }
            
        
        })

          // bind the error event so it doesn't get thrown
            
          req.on('error', (e)=>{
            callBack(e);
        })
        
        // add the payload
        req.write(stringPayload);
        
        // end the request 
        
        req.end();

    }else{
        callBack("Given parameter were missing or invalid")
    }
}


// Get the string content of a template

helpers.getTemplate = (templateName, data, callBack)=>{
    templateName = typeof(templateName) == "string" && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data !== null ? data : {};
    if(templateName){
        let templateDir = path.join(__dirname, './../template/')

        fs.readFile(templateDir+templateName+'.html', 'utf8', (err, str)=>{
            
            if(!err && str && str.length>0){
                console.log('olo',str)
                callBack(false, str);
            }else{
                callBack("No template could be found")
            }

        })
    }else{
        callBack("A valid template name was not specified")
    }
}

// add the universal header and footer to a string & pass provider data object to header and footer for interpolation 
helpers.addUniversalTemplates = (str, data, callBack)=>{
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    // Get the header 
    helpers.getTemplate("_header", data, (err, headerString)=>{
        if(!err && headerString){
            // gett the footer
            helpers.getTemplate("_footer", data, (err, footerString)=>{
                if(!err && footerString){

                    // add them all together
                    let fullString = headerString+str+footerString;
                    callBack(false, fullString);
                }else{
                    callBack("Couldn't find the footer template")
                }
            })
        }else{
            callBack("Couldn't find the footer template")
        }
    })
}


// export the moudle 
module.exports = helpers;