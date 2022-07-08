//  Dependencies
var fs = require('fs');
var path = require('path');
// var ab  = require('.')
// Container for module (to be exported)
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname,'./../.data/');

// Write data to a file
lib.create = function(dir,file,data,callback){
  // Open the file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
    console.log(err, "f");
    if(!err && fileDescriptor){
      // Convert data to string
      
      var stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });

};

// read file

lib.read = function(dirName, fileName, callBack){

  fs.readFile(lib.baseDir+dirName+"/"+fileName+".json",'utf8',function(err, data){
    if(!err){
      console.log(data);
    }else{
      callBack("Error reading file", err)
    }
  } )
}


// update data in file

lib.update = function(dirName, fileName,data, callBack){

  fs.open(lib.baseDir+dirName+"/"+fileName+".json", 'r+', function(err,fileDescriptor){
    if(!err && fileDescriptor){
      const dataString = JSON.stringify(data);

      // truncate file 
      fs.ftruncate(fileDescriptor, function(err){
        if(!err){
          // write to file and close it 
          fs.writeFile(fileDescriptor,dataString,function(err){
            if(!err){
              fs.close(fileDescriptor, function(err){
                if(!err){
                  callBack(false);
                }else{
                  callBack('Error closing file')
                }
              })
            }else{
              callBack("Error writing file")
            }
          })
        }else{
        callBack('Error truncating file')
        }
      })
    }else{
      callBack('Error while openning file')
    }
  })
}

module.exports = lib;

