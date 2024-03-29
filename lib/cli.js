/*
 * CLI-related tasks
 *
 */

// Dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
class _events extends events { };
var e = new _events();
let os = require('os');
let v8 = require('v8');
const _data = require('./data')
const _logs = require('./logs');
const helpers = require('./helpers');

// Instantiate the cli module object
var cli = {};


/** Input handlers */
e.on('man', () => {
  cli.responders.help();
})


e.on('help', function (str) {
  cli.responders.help();
});

e.on('exit', function (str) {
  cli.responders.exit();
});

e.on('stats', function (str) {
  cli.responders.stats();
});

e.on('list users', function (str) {
  cli.responders.listUsers();
});

e.on('more user info', function (str) {
  cli.responders.moreUserInfo(str);
});

e.on('list checks', function (str) {
  cli.responders.listChecks(str);
});

e.on('more check info', function (str) {
  cli.responders.moreCheckInfo(str);
});

e.on('list logs', function () {
  cli.responders.listLogs();
});

e.on('more log info', function (str) {
  cli.responders.moreLogInfo(str);
});


// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function () {

  /** Codify the commands and their desc */

  let commands = {
    'exit': 'Kill the CLI (and the rest of the application)',
    'man': 'Show this help page',
    'help': 'Alias of the "man" command',
    'stats': 'Get statistics on the underlying operating system and resource utilization',
    'List users': 'Show a list of all the registered (undeleted) users in the system',
    'More user info --{userId}': 'Show details of a specified user',
    'List checks --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
    'More check info --{checkId}': 'Show details of a specified check',
    'List logs': 'Show a list of all the log files available to be read (compressed and uncompressed)',
    'More log info --{logFileName}': 'Show details of a specified log file',
  }

  /** Show a header for the help page that is as wide as the screen size */

  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace();

  for(let key in commands){
    if(commands.hasOwnProperty(key)){
      let value = commands[key];

      let line = '\x1b[33m'+key+'\x1b[0m';
      let padding = 40 - line.length;

      for(let i=0; i<padding; i++){
        line+=" ";
      }

      line+=value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace(1);

  /** End with another horizontal line */
  cli.horizontalLine();

};


/** Create a vertical space */
cli.verticalSpace = (lines)=>{
  lines = typeof(lines) == 'number' && lines >0 ? lines : 1;

  for(let i=0; i<lines; i++){
    console.log("");
  }
}

/** Create a horizontal line across the scree */

cli.horizontalLine = ()=>{
  const width = process.stdout.columns;
  let line = "";
  for(let i=0; i<width; i++){
    line+="-";
  }
  console.log(line);
}

/** Create centered text on the screen */

cli.centered =(str)=>{
  const width = process.stdout.columns;

  /**calculate the left padding there should be */
  let leftPadding = Math.floor((width - str.length)/2);
  let line = "";
  for(let i =0; i< leftPadding; i++){
    line+= " ";
  }
  line+= str;

  console.log(line);
}

// Exit
cli.responders.exit = function () {
  process.exit(0)
};

// Stats
cli.responders.stats = function () {
  
  let stats = {
    'Load Average' : os.loadavg().join(' '),
    'CPU Count' : os.cpus().length,
    'Free Memory' : os.freemem(),
    'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime' : os.uptime()+' Seconds'
  }


   /** Show a header for the help page that is as wide as the screen size */

   cli.horizontalLine();
   cli.centered("CLI MANUAL");
   cli.horizontalLine();
   cli.verticalSpace();
 
   for(let key in stats){
     if(stats.hasOwnProperty(key)){
       let value = stats[key];
 
       let line = '\x1b[33m'+key+'\x1b[0m';
       let padding = 40 - line.length;
 
       for(let i=0; i<padding; i++){
         line+=" ";
       }
 
       line+=value;
       console.log(line);
       cli.verticalSpace();
     }
   }
 
   cli.verticalSpace(1);
 
   /** End with another horizontal line */
   cli.horizontalLine();


};

// List Users
cli.responders.listUsers = function () {
  _data.list('users',(err, userIds)=>{
    if(!err && userIds && userIds.length >0){
      cli.verticalSpace();
      userIds.forEach ((userId)=>{
      _data.read('users', userId, (err, userData)=>{
        if(!err && userData){
          let line = 'Name: '+userData.firstName+' '+userData.lastName+' Phone: '+userData.phone+' Checks: ';
          let numberOfChecks =  typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;

          line+= numberOfChecks;

          console.log(line);
          cli.verticalSpace();
        }
      })
      })
    }
  })
};

// More user info
cli.responders.moreUserInfo = function (str) {
  let arr = str.split('--');

  let userId = typeof(arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1] : false;

  if(userId){
    /** Look up the user */
    _data.read('users', userId, (err, userData)=>{
      //remove the hased password
      delete userData.hashPass;
      //print the JSON with highlighting
      cli.verticalSpace();
      console.dir(userData, {'colors': true});
      cli.verticalSpace();
    })
  }
};

// List Checks
cli.responders.listChecks = function (str) {
    _data.list('checks', (err, checkIds)=>{
      if(!err && checkIds && checkIds.length >0){
        cli.verticalSpace();

        checkIds.forEach(checkId =>{

          _data.read('checks', checkId, (err, checkData)=>{
            if(!err && checkData){
              let lowerString = str.toLowerCase();

              // get the state or default to down
              let state = typeof(checkData.state) == 'string' ? checkData.state : down;
            
              // get the state, default to unknown
              let stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';

              if((lowerString.indexOf('--'+state)) > -1 || (lowerString.indexOf("--down") == -1 && lowerString.indexOf("--up") == -1)){
                var line = 'ID: '+checkData.id+' '+checkData.method.toUpperCase()+' '+checkData.protocol+'://'+checkData.url+' State: '+stateOrUnknown;
                console.log(line);
                cli.verticalSpace();
              }
            }
          })
        })
      }
    })
};

// More check info
cli.responders.moreCheckInfo = function (str) {
 
  let arr = str.split('--');

  let checkId = typeof(arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1] : false;

  if(checkId){
    /** Look up the user */
    _data.read('checks', checkId, (err, checkData)=>{
      //print the JSON with highlighting
      cli.verticalSpace();
      console.dir(checkData, {'colors': true});
      cli.verticalSpace();
    })
  }
};

// List Logs
cli.responders.listLogs = function () {
  _logs.list(true, (err, logFileNames)=>{
    if(!err && logFileNames){
      logFileNames.forEach(logFileName =>{
        if(logFileName.indexOf("-")> -1){
          console.log(logFileName);
          cli.verticalSpace();
        }
      })
    }
  })
};

// More logs info
cli.responders.moreLogInfo = function (str) {
  
  let arr = str.split('--');

  let fileName = typeof(arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1] : false;

  if(fileName){
   cli.verticalSpace();

   //decompress it

   _logs.decompress(fileName, (err, strData)=>{
    if(!err && strData){
      //split into lines
      let arr = strData.split("\n");

      arr.forEach((jsonString)=>{
        let logObject = helpers.parseJsonToObjec(jsonString);

        if(logObject && JSON.stringify(logObject) !== "{}"){
          console.dir(logObject, {"colors": true});
          cli.verticalSpace();
        }
      })
    }
   })
  }
};



// Input processor
cli.processInput = function (str) {
  str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if (str) {
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info'
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function (input) {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input, str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Sorry, try again");
    }

  }
};

// Init script
cli.init = function () {

  // Send to console, in dark blue
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', function (str) {
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function () {
    process.exit(0);
  });

};


// Export the module
module.exports = cli;