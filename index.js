/** 
*Primary file for the Api
* @primiray_file
*/

/**
 * Dependencies
 * 
 */

const server  = require('./lib/server');
const worker = require('./lib/worker');




/** all the server will be initiating in app object */
const app = {}


/** Init function */

app.init = ()=>{

  // Start the server
  server.init();
 worker.init();
  

}


/** self executing */
app.init();


/** Export the app */

module.exports = app;