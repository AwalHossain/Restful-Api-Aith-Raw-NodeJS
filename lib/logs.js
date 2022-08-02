/*
 * Library for storing and rotating logs
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');


//  container for module (to be exported);

let lib = {};

// base director
lib.baseDir = path.join(__dirname,"./../.logs/");
console.log(lib.baseDir);
// append a string to a file, create the file if it doesn't exist

lib.append = (file, str, callBack)=>{
console.log(file, str);
    // Open the file for appending 
    fs.open(lib.baseDir+file+'.log', 'a', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            // append to file and close it
            fs.appendFile(fileDescriptor, str+"\n", (err)=>{
                if(!err){
                    fs.close(fileDescriptor, (err)=>{
                        if(!err){
                            console.log(fileDescriptor,"ialos");
                    callBack(false)
                            
                        }else{
                            console.log("Error closing file that was being appended")
                        }
                    })
                }else{
                    console.log("couldn't open file for appending")
                }
            });
        }else{
            console.log("Couldn't open file for appending")
        }
    })
}

module.exports = lib;