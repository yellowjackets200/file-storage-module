'use strict';

var express = require('express');
var controller = require('../controllers/file-controller');
var multiparty = require('multiparty');
var router = express.Router();

function multiparser (req, res, next) {
  if (req.url === '/' && req.method.match(/POST|PUT/)) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
      if (err) {
        return handleError(err, res);
      }
      req.files = files;
      req.fields = fields;
      next();
    });
  }
}

router.post('/', multiparser, function (req, res) {
  controller.uploadFile(req.fields.hostName, req.files.file[0], function (err, hash) {
    if (err) {
      return handleError(err, res);
    }
    res.send(hash);
  });
});

router.get('/all', function (req, res) {
  controller.listFiles(function (err, list) {
    if (err) {
      return handleError(err, res);
    }
    res.send(list);
  });
});

router.get('/:hash', function (req, res) {
  controller.getFile(req.params.hash, function (err, stream, result) {
    if (err) {
      return handleError(err, res);
    }
    if (stream) {
      stream.on('data', function (data) { // 64 kb data chunks.
        res.write(data);
      }).on('end', function () {
        res.end();
      }).on('close', function () {
        res.send();
      }).on('error', function (err) {
        return handleError(err, res);
      });
    } else {
      res.send(result);
    }
  });
});

router.delete('/:hash', function (req, res) {
  controller.deleteFile(req.params.hash, function (err, result) {
    if (err) {
      return handleError(err, res);
    }
    res.send(result);
  });
});

function handleError (err, res) {
  res.send(err);
}

module.exports = router;
