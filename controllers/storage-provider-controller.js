'use strict';

var fs = require('fs');
var path = require('path');

function saveFile (fileName, stream, callback) {
  var filePath = path.join(__dirname, '/../localStorage/', fileName);
  stream.pipe(fs.createWriteStream(filePath))
    .on('close', function () {
      callback(null, filePath);
    })
    .on('error', function (err) {
      return callback(err, null);
    });
}

function getFile (hostedId) {
  return fs.createReadStream(hostedId); // This is synchronous. No need to use callback.
}

function removeFile (hostedId, callback) {
  fs.access(hostedId, fs.F_OK, function (err) {
    if (err) {
      return callback('Could not access file in Host.', null);
    }
    fs.unlink(hostedId, function (err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, 'File removed from Host.');
    });
  });
}

module.exports = {
  localFileSystem: {
    save: saveFile,
    get: getFile,
    remove: removeFile
    // Update not implemented since different versions of the same document can be stored independently.
  }
};
