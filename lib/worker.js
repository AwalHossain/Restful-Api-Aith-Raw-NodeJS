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
let _logs = require('./logs')

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
    originalCheckData.timeoutSecods = typeof(originalCheckData.timeoutSecods) == 'number' && originalCheckData.timeoutSecods % 1 === 0 && originalCheckData.timeoutSecods >= 1 && originalCheckData.timeoutSecods <= 5 ? originalCheckData.timeoutSecods : false;
    
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
    originalCheckData.timeoutSecods){
      workers.performCheck(originalCheckData);
    } else {
      // If checks fail, log the error and fail silently
      console.log("Error: one of the checks is not properly formatted. Skipping.");
    }
  };


//   Perform the check, send theo originalCheck data and the outcome of the process to the next step inthe process

workers.performCheck = (originalCheckData)=>{
    // prepare the initial check outcomme
    let checkOutcome = {
        'error': false,
        'responseCode': false
    }

    // Mark that outcome has not been sent yet
    let outcomeSent = false;

    // parse the hostname and path out of thecheckData
    let parsedUrl =  url.parse(originalCheckData.protocol+"://"+originalCheckData.url, true);
    let hostname = parsedUrl.hostname;
    let path = parsedUrl.path; // using path not pathName we want to queryString

     // Construct the request
  var requestDetails = {
    'protocol' : originalCheckData.protocol+':',
    'hostname' : hostname,
    'method' : originalCheckData.method.toUpperCase(),
    'path' : path,
    'timeout' : originalCheckData.timeoutSecods * 1000
  }


// Instantiate the request object(using either http or https)
let _moduleToUse = originalCheckData.protocol == 'http'? http : https;

let req = _moduleToUse.request(requestDetails, (res)=>{
    // grab the status code of the sent request
    let status = res.statusCode;

    // update the checkoutcome and the data along
    checkOutcome.responseCode = status;
    console.log(status,"o");
    if(!outcomeSent){
        workers.processCheckOutcome(originalCheckData, checkOutcome);
        outcomeSent=true;
    }

    


})

// Bind to the error so it doesn't get thrown
req.on('error', (e)=>{
    // update the checkoutcome
    checkOutcome.error = {"error": true, 'value':e};
    if(!outcomeSent){
        workers.processCheckOutcome(originalCheckData, checkOutcome);
        outcomeSent = true;
    }
})

// Bind to the error event so it doesn't get thrown
req.on('timeout', ()=>{
    checkOutcome.error = {"error": true, 'value':"timeout"};
    if(!outcomeSent){
        workers.processCheckOutcome(originalCheckData, checkOutcome);
        outcomeSent = true;
    }
})


    // end the request
    req.end();
}




// process the check outcome, update the check data as needed, trigger an alert

workers.processCheckOutcome=(originalCheckData, checkOutcome)=>{
    // decided if the check is considered up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? "up" : "down";

    // Decide if an alert is warranted

    let alertWarrented = originalCheckData.lastChecked && originalCheckData.state !== state ? true :false ;

    // Log the outcome
    let timeOfCheck = Date.now();
    workers.log(originalCheckData, checkOutcome, state, alertWarrented, timeOfCheck)

    // update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    // save the updates 
    _data.update('checks', newCheckData.id, newCheckData, (err)=>{
        if(!err){
            // send the new check data to the next phase in the process if nedded 
            if(alertWarrented){
                workers.alertUserToStatusChange(newCheckData);
            }else{
                console.log("Check outcome has not changed, no alert nedded" )
            }
        }else{
            console.log("Err while updating checks")
        }
    })

    // update the check data
}


// Alert the user as to a change in theri status

workers.alertUserToStatusChange = (newCheckData)=>{
    let msg = 'Alert: Your check for '+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;

    helpers.sendTwilioSms(newCheckData.userPhone, msg, (err)=>{
        if(!err){
            console.log("User was alerted to a status change")
        }else{
            console.log("Couldn't send the sms alert");
        }
    })
}


workers.log = (originalCheckData, checkOutcome,state, alertWarrented, timeOfCheck)=>{

    // from the log data
console.log(alertWarrented,"oo");
    let logData = {
        'check': originalCheckData,
        "outcome": checkOutcome,
        "state": state,
        "alert": alertWarrented,
        "time": timeOfCheck
    }

    // convert the data to a string 
    let logString = JSON.stringify(logData);

    // determine thename ofthe log file

    let logFileName = originalCheckData.id;

    // append the log string to the file
    _logs.append(logFileName, logString, (err)=>{
        if(!err){
            console.log("Logging to the file succeeded");
        }else{
            console.log("Loging to file failed");
        }
    })
}




// Timer to execute the worker-process once  per min

workers.loop= ()=>{
    setInterval(()=>{
        workers.gatherAllChecks();
    }, 1000*40)
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