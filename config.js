

var environment = {};


environment.stagging = {
    "port": 3000,
    "envName":"staging"
}

environment.production = {
    
    "port": 5000,
    "envName":"production"
}


//  Determine which environment was passed as command line

var currenntEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : '';

//check the current environment is one of the environment above, if so added or put a defaul one

 var environmentToExport = typeof(environment[currenntEnvironment]) === 'object' ? environment[currenntEnvironment] : environment.stagging;



 module.exports = environmentToExport;