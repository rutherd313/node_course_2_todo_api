//---DataBase Configuration
var mongoose = require('mongoose');

//use built in Promise library
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');
//---DataBase Configuration

module.exports = {mongoose};