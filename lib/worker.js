/*
 * Worker-related tasks
 *
 */

 // Dependencies
 var path = require('path');
 var fs = require('fs');
 var _data = require('./data');
 var https = require('https');
 var http = require('http');
 var helpers = require('./helpers');
 var url = require('url');


/** Instantiate the worker module */

let workers = {};

// Lookup all the checks, get their data send to validatior

workers.gatherAllChecks = ()=>{

    // get all the checks
    _data.list('checks', (err, checks)=>{

        if(!err && checks && checks.length>0){

            checks.forEach((check)=>{

                // Read in the check data
                _data.read('checks', check, (err, originalCheckData)=>{
                    if(!err && originalCheckData){
                        // pass it to the check validator to checks's data:

                        workers.validateCheckData(originalCheckData);
                    }else{
                        console.log("Error reading one of the check's data: ",err);
                    }
                })
            })

        }else{
            console.log("Error reading one of the checks's data", err);
        }
    })
}

/** Sanity-check the check-data */

// Sanity-check the check-data,
workers.validateCheckData = function(originalCheckData){
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
    originalCheckData.method = typeof(originalCheckData.method) == 'string' &&  ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;
    // Set the keys that may not be set (if the workers have never seen this check before)
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;
  
    // If all checks pass, pass the data along to the next step in the process
    if(originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds){
      workers.performCheck(originalCheckData);
    } else {
      // If checks fail, log the error and fail silently
      console.log("Error: one of the checks is not properly formatted. Skipping.");
    }
  };


//   Perform the check, send theo originalCheck data and the outcome of the process to the next step inthe process

workers.performCheck = (originalCheckData)=>{
    
}



// Timer to execute the worker-process once  per min

workers.loop= ()=>{
    setInterval(()=>{
        workers.gatherAllChecks();
    }, 1000*60)
}


/** Init the script */

workers.init = function(){

    /** Execute all the checks immediately */
    workers.gatherAllChecks();

    // call the loop so the checks will execute immediately
    workers.loop();
}


// Export the module 

module.exports = workers;