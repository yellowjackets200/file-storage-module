'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fileSchema = new Schema({
  hash: { type: String, unique: true },
  storageProvider: {
    hostName: String,
    hostedId: String
  },
  // permissions: Object,
  fileName: String,
  size: Number,
  lastModifiedMs: Number
});

module.exports = mongoose.model('File', fileSchema);
