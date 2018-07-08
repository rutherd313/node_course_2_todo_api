//---DataBase Configuration
var mongoose = require('mongoose');

//use built in Promise library
mongoose.Promise = global.Promise;
//makes sure heroku app connects to actual database
//process.env.MONGODB_URI from creating heroku sandbox
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');
//---DataBase Configuration

module.exports = {mongoose};