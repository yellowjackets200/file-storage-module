'use strict';

var File = require('../models/file.js');
var spController = require('./storage-provider-controller');
var crypto = require('crypto');
var fs = require('fs');

function uploadFile (hostName, reqFile, callback) {
  createFile(hostName, reqFile, function (file) {
    var stream = fs.createReadStream(reqFile.path);
    createHash(file, stream, function (err, hash) {
      if (err) {
        return callback(err, null);
      }
      file.hash = hash;
      // We cannot pipe twice a stream, so let's set it up again.
      stream = fs.createReadStream(reqFile.path);
      var nameForStorage = file.fileName.concat('_').concat(hash.slice(0, 7));
      spController[hostName].save(nameForStorage, stream, function (err, hostedId) {
        if (err) {
          return callback(err, null);
        }
        file.storageProvider.hostedId = hostedId;
        file.save(function (err) {
          if (err) {
            return callback(err, null);
          }
          callback(null, hash);
        });
      });
    });
  });
}

function listFiles (callback) {
  File.find({}, null, { sort: { 'storageProvider.hostName': 1, 'fileName': 1, 'lastModifiedMs': -1 } }, function (err, files) {
    if (err) {
      return callback(err, null);
    }
    if (files.length > 0) {
      callback(null, files.map(function (file) {
        return { fileName: file.fileName, storageProvider: file.storageProvider.hostName, hash: file.hash, date: (new Date(file.lastModifiedMs)).toUTCString() };
      }));
    } else {
      callback(null, 'No files found in DB.');
    }
  });
}

function getFile (hash, callback) {
  File.find({ hash: hash }, function (err, file) {
    if (err) {
      return callback(err, null, null);
    }
    if (file.length > 0) {
      var hostName = file[0].storageProvider.hostName;
      var hostedId = file[0].storageProvider.hostedId;
      var stream = spController[hostName].get(hostedId);

      createHash(file[0], stream, function (err, hash) {
        if (err) {
          return callback(err, null, null);
        }
        if (file[0].hash === hash) { // Integrity OK => Get the stream again to send it back to the client.
          stream = spController[hostName].get(hostedId);
          callback(null, stream, null);
        } else {
          return callback(null, null, 'Not retrieved because hash of document is not the same.');
        }
      });
    } else {
      callback(null, null, 'File not found in DB.');
    }
  });
}

function deleteFile (hash, callback) {
  File.find({ hash: hash }, function (err, file) {
    if (err) {
      return callback(err, null);
    }
    if (file.length > 0) {
      var hostName = file[0].storageProvider.hostName;
      var hostedId = file[0].storageProvider.hostedId;
      spController[hostName].remove(hostedId, function (err, result) {
        if (err) {
          return callback(err, null);
        }
        File.remove({ hash: hash }, function (err) {
          if (err) { // File removed from Host. Failed to delete from DB.
            return callback(err, null);
          }
          callback(null, result.concat(' File deleted from DB.'));
        });
      });
    } else {
      callback(null, 'File not found in DB.');
    }
  });
}

function createFile (hostName, reqFile, callback) {
  var file = new File({
    storageProvider: {
      hostName: hostName
    },
    fileName: reqFile.originalFilename,
    size: reqFile.size,
    lastModifiedMs: Date.now()
  });
  callback(file);
}

function createHash (file, stream, callback) {
  var hash = crypto.createHash('sha1');
  var isEmpty = true;
  hash.update(file.storageProvider.hostName.concat(file.fileName));

  stream.on('data', function (data) { // 64 kb data chunks.
    isEmpty = false; // Executed every 64 kb, but it is the easiest way to make sure we do not upload/return empty files.
    hash.update(data);
  }).on('end', function () {
    if (isEmpty) {
      hash.end();
      callback('File is empty.', null);
    } else {
      callback(null, hash.digest('hex'));
    }
  }).on('error', function (err) {
    hash.end();
    return callback(err, null);
  });
}

module.exports = {
  uploadFile: uploadFile,
  listFiles: listFiles,
  getFile: getFile,
  deleteFile: deleteFile
};
