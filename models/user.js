// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  user: String,
  key: String
});

module.exports = mongoose.model('User', userSchema);
