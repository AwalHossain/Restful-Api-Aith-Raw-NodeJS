

const environment = {};

environment.stagging = {
    "httpPort": 3000,
    "httpsPort": 3001,
    "envName": "stagging",
    "hashingSecret":"thisIsASecret",
    "maxChecks": 5,
    'twilio' : {
        'accountSid' : 'ACf62a4949723e51211a182f2fe3af6561d',
        'authToken' : '605d623fa82989daebff221d03a8e8bdf',
        'fromPhone' : '+19032705266'
      },
      'templateGlobals' : {
        'appName' : 'UptimeChecker',
        'companyName' : 'NotARealCompany, Inc.',
        'yearCreated' : '2018'
      }
}

environment.production = {
    "httpPort": 5000,
    "httpsPort": 5001,
    "envName": "production",
"hashingSecret":"thisIsASecret",
 "maxChecks": 5,
 'twilio' : {
    'accountSid' : 'ACf62a4949723e51211a182f2fe3af6561',
    'authToken' : '9f78313fb3f2231fe1b8b2d2f998e62c',
    'fromPhone' : '+19032705266'
  },
  'templateGlobals' : {
    'appName' : 'UptimeChecker',
    'companyName' : 'NotARealCompany, Inc.',
    'yearCreated' : '2018'
  }

}



//  DETERMINE WHICH ENVIRONMENT WAS PASSED AS COMMAND LINE

let currenEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : "";


//check the current environment is one of the environment above, if so added or put a defaul one

let environmentToExport = typeof(environment[currenEnv]) === 'object' ? environment[currenEnv] : environment.stagging;






 module.exports = environmentToExport;