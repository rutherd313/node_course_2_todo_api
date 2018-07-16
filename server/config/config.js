//Testing the database
var env = process.env.NODE_ENV || 'development';
//console.log('env *****', env);

//loading in config when in test or development
if (env === 'development' || env === 'test') {
	//setting up json file
	//using require on a json file automaticall parses the json file
	//into a js file
	var config = require('./config.json');
	//sets up current environments
	//when using var to access a property, use bracket notation
	var envConfig = config[env]

	//takes an obj, takes all the keys and returns them as arrays
	//forEach loops thru each key
	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key];
	});
}

/*//Heroku is unaffected because env is already set in 'production'
if (env === 'development') {
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest'
}*/