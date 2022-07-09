

const environment = {};

environment.stagging = {
    "httpPort": 3000,
    "httpsPort": 3001,
    "envName": "stagging",
    "hashingSecret":"thisIsASecret"
}

environment.production = {
    "httpPort": 5000,
    "httpsPort": 5001,
    "envName": "production",
"hashingSecret":"thisIsASecret"

}



//  DETERMINE WHICH ENVIRONMENT WAS PASSED AS COMMAND LINE

let currenEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : "";


//check the current environment is one of the environment above, if so added or put a defaul one

let environmentToExport = typeof(environment[currenEnv]) === 'object' ? environment[currenEnv] : environment.stagging;






 module.exports = environmentToExport;