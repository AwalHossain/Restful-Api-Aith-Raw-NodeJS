/**
 * Helpers for various task
 */


// Dependencies

let config = require('./config');
let crypto = require('crypto');

// container for the helpers
let helpers = {}


// create a sha256 hash

helpers.hash = function(str){
    if(typeof(str) === 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');

        return hash;
    }else{
        return false;
    }

}


// export the moudle 
module.exports = helpers;