/**
 * Helpers for various task
 */


// Dependencies

let config = require('./config');
let crypto = require('crypto');

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
    console.log( typeof(strLength) === 'number', strLength,"o");
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
// export the moudle 
module.exports = helpers;