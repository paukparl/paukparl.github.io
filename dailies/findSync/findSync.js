'use strict';

const fs = require('fs');

const findSync = (dir, filename, options, fileList) => {

  // Set default option when none is given.
  // Will look for one (instead of many) file (not folder) by default.
  // find_one  = true  ->  first match will be returned as a JSON object.
  //           = false ->  an array of all matches will be returned.
  // find_file = true  ->  will look for only files matching the filename
  //           = false ->  will look for only folders matching the filename
  
  if (options) {
    if (!options.hasOwnProperty('find_one')) options.find_one = true;
    if (!options.hasOwnProperty('find_file')) options.find_file = true;
  } else {
    options = {
      find_one: true,
      find_file: true
    }
  }

  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {

    // make an empty array if fileList is undefined
    fileList = fileList || [];

    const file = files[i];

    // if fileList is an object (not an array,) the one requested match has already been found
    if (fileList.constructor === {}.constructor) return fileList;
    
    if (fs.lstatSync(dir + file).isFile()) {
      if (options.find_file && file === filename) fileList.push({dir, file});
      if (options.find_one && 0 < files.length) return fileList[0];
    }
    else {
      
      if (!options.find_file && file === filename) fileList.push({dir, file});
      if (options.find_one && 0 < fileList.length) return fileList[0];
      
      fileList = findSync(dir + file + '/', filename, options, fileList);
    }
  }

  if (!fileList || fileList.length === 0) return undefined;
  else return fileList;
}

module.exports = {findSync};