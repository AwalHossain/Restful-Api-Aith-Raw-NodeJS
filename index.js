/** 
*Primary file for the Api
* 
*/

/**
 * Dependencies
 * 
 */

const server  = require('./lib/server');
const worker = require('./lib/worker');
const cli = require('./lib/cli')



/** all the server will be initiating in app object */
const app = {}


/** Init function */

app.init = ()=>{

  // Start the server
  server.init();
 worker.init();

 /** Start the cli, but make sute it starts last */
  
 setTimeout(()=>{
  cli.init();
 },50)

}


/** self executing */
app.init();


/** Export the app */

module.exports = app;