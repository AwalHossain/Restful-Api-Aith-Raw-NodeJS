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
// append a string to a file, create the file if it doesn't exist

lib.append = (file, str, callBack)=>{
    // Open the file for appending 
    fs.open(lib.baseDir+file+'.log', 'a', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            // append to file and close it
            fs.appendFile(fileDescriptor, str+"\n", (err)=>{
                if(!err){
                    fs.close(fileDescriptor, (err)=>{
                        if(!err){
                    callBack(false)
                            
                        }else{
                            debug("Error closing file that was being appended")
                        }
                    })
                }else{
                    debug("couldn't open file for appending")
                }
            });
        }else{
            debug("Couldn't open file for appending")
        }
    })
}


lib.list = (includeCompressLogs, callBack)=>{
    fs.readdir(lib.baseDir, (err,data)=>{
        if(!err && data && data.length > 0){
            let trimmedFilesNames = [];
            
            data.forEach((fileName)=>{
                // add the .log file
                if(fileName.indexOf('.log') > -1){
                    trimmedFilesNames.push(fileName.replace(".log",""));
                }
                
                // add the .gz files
                if(fileName.indexOf('.gz.b64') > -1 && includeCompressLogs){
                    trimmedFilesNames.push(fileName.replace('.gz.b64', ""));
                }
            })

            callBack(false, trimmedFilesNames)
        }else{
            callBack(err, data)
        }
    })
}


// compress the contents of one .log file into a .gz.b64 file with in the same directory

lib.compress = (logId, newFileId, callBack)=>{
    let sourceFile= logId+".log";
    let destFile= newFileId+".gz.b64";

    // read the source file
    fs.readFile(lib.baseDir+sourceFile, 'utf-8', (err, inputString)=>{
        if(!err && inputString){
            // compress the data using gzip
            zlib.gzip(inputString, (err, buffer)=>{
                if(!err && buffer){
                    // send data to the destination file
                    fs.open(lib.baseDir+destFile, 'wx', (err, fileDescriptor)=>{
                        if(!err && fileDescriptor){
                            // write to the file destination file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), (err)=>{
                                if(!err){
                                    // close the destination file
                                    fs.close(fileDescriptor, (err)=>{
                                        if(!err){
                                            callBack(false);
                                        }else{
                                            callBack(err);
                                        }
                                    })
                                }else{

                                }
                            })
                        }else{  
                                callBack(err)
                        }
                    })
                }else{
                    callBack(err)
                }
            })
        }else{
            callBack(err)
        }
    })
}


// truncate a log file
lib.truncate= (logId, callBack)=>{
    fs.truncate(lib.baseDir+logId+".log", 0, (err)=>{
        if(!err){
            callBack(false)
        }else{
            callBack(err);
        }
    })
}

module.exports = lib;