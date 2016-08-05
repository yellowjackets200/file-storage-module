'use strict';

var express = require('express');
var app = express();

var fileRouter = require('./routes/file-routes');
var mongoose = require('mongoose');

// function validateUser(req, res, next) {
//  next()
// }
// app.use(validateUser)

app.use('/file', fileRouter);

mongoose.connect('mongodb://localhost/database');

app.listen(3000);
