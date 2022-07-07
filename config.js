

const environment = {};

environment.stagging = {
    "port": 3000,
    "envName": "stagging"

}

environment.production = {
    "port": 5000,
    "envName": "production"
}



//  DETERMINE WHICH ENVIRONMENT WAS PASSED AS COMMAND LINE

let currenEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : "";


//check the current environment is one of the environment above, if so added or put a defaul one

let environmentToExport = typeof(environment[currenEnv]) === 'object' ? environment[currenEnv] : environment.stagging;






 module.exports = environmentToExport;