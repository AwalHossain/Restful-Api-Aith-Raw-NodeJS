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

helpers.parseJsonToObjec = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return {}
  }
}

// create a sha256 hash

helpers.hash = function (str) {
  if (typeof (str) === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');

    return hash;
  } else {
    return false;
  }

}

helpers.createRandomString = function (strLength) {
  strLength = typeof (strLength) === 'number' && strLength > 0 ? strLength : false;
  if ((strLength)) {
    const possibleCharacter = "abcdefghijklmnopqrstwvxyz0123456789";
    let str = ""

    for (let i = 0; i < strLength; i++) {

      // get the random character from the possible character

      const randomCharacter = possibleCharacter.charAt(Math.floor(Math.random() * possibleCharacter.length));

      str += randomCharacter;

    }

    return str;
  } else {
    return false
  }
}

/**
 * sending sms through twilio api
 */

helpers.sendTwilioSms = function (phone, msg, callBack) {
  // validate parameters
  phone = typeof (phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false;
  msg = typeof (msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 16000 ? msg.trim() : false;

  if (phone && msg) {
    // configure the requrest payload

    let paylaod = {
      "From": config.twilio.fromPhone,
      "To": "+880" + phone,
      "Body": msg
    }

    let stringPayload = querystring.stringify(paylaod);

    // configure the request details

    let requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    }

    // instantiate the request object 
    let req = https.request(requestDetails, (res) => {
      // Grab the status of the sent request

      let status = res.statusCode;

      // callBack successfully if the request went through

      if (status === 200 || status === 201) {
        callBack(false);
      } else {
        callBack("Status code returened was" + status);
      }


    })

    // bind the error event so it doesn't get thrown

    req.on('error', (e) => {
      callBack(e);
    })

    // add the payload
    req.write(stringPayload);

    // end the request 

    req.end();

  } else {
    callBack("Given parameter were missing or invalid")
  }
}


// Get the string content of a template
// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = function (templateName, data, callback) {
  templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof (data) == 'object' && data !== null ? data : {};
  if (templateName) {
    var templatesDir = path.join(__dirname, './../template/');
    fs.readFile(templatesDir + templateName + '.html', 'utf8', function (err, str) {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        var finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};


// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = function (str, data, callback) {
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header', data, function (err, headerString) {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, function (err, footerString) {
        if (!err && headerString) {
          // Add them all together
          var fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};


// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function (str, data) {
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for (var keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName]
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (var key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key] == 'string')) {
      var replace = data[key];
      var find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }
  return str;
};



// Get the contents of a static (public) asset
helpers.getStaticAsset = function (fileName, callback) {
  fileName = typeof (fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if (fileName) {
    var publicDir = path.join(__dirname, './../public/');
    fs.readFile(publicDir + fileName, function (err, data) {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};



// export the moudle 
module.exports = helpers;