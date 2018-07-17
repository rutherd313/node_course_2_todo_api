//server.js is responsible for routes

require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb')

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

//Setup the app to use the environment port var that heroku
//is going to set. Will only run on heroku, not run if local
const port = process.env.PORT;

//Getting the body data that got sent from client
app.use(bodyParser.json());

//CreateReadUpdateDelete(CRUD)
//Create
//authenticate = access to user and token used 
app.post('/todos', authenticate, (req, res) => {
	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

//get('/todos') route 
//returning all of todos
app.get('/todos', authenticate, (req, res) => {
	Todo.find({
		//only returns user logged that was created
		_creator: req.user._id
	}).then((todos) => {
		res.send({todos})
	}, (e) => {
		res.status(400).send(e);
	});
});

//Call Get todos with specific id
//url params = :name, this created id var. It will be on the
//req obj, and will be able to access that variable
app.get('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id
//req.params is an obj with key/value pairs where key is
//the url param(id) & val is on what is placed on id
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	//Quering database
	Todo.findOne({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {
		if(!todo) {
			return res.status(404).send();
		}
		//success path
		res.send({todo});
	}).catch((e) => {
		res.status(400).send()
	});
});
	
//Route that deletes a todo
app.delete('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;
	//validate the id
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	//remove todo by id
	Todo.findOneAndRemove({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		res.status(400).send()
	});
});

//HTTP patch method = used to update a resource
app.patch('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;
	//where updates used by lodash will be stored
	//only pull off properties that users can update=_.pick()
	//2nd arg = arrays that want to pull off if they exist
	var body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	//checking the completed value and using that value to set
	//completedAt
	if(_.isBoolean(body.completed) && body.completed){
		//If boolean and True
		body.completedAt = new Date().getTime();
	} else {
		//Not boolean and not True
		body.completed = false;
		body.completedAt = null;
	}

	//Making a query to update the database
	//body from line 90
	Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(404).send()
	})
});

//Validate email
//POST /users, use _.pick
app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	//Auth tokens
	//Model methods: Capital letter
	//Does not require individual document, due to being custom
	// User.findByToken()

	//Instance methods: lowercase letter
	//resp for adding a token onto the individual user document,
	//saving it and returning the token, so can be sent back to user
	//user.generateAuthToken
	user.save().then(() => {
		//from user.js, line 37
		return user.generateAuthToken();
	}).then((token) => {
		//when prefixing header as 'x-', a custom header is created
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	})
});


//Creating private routes
//This route will require authentication, which needs valid x-auth token
//It will find associated user and send user back
app.get('/users/me', authenticate, (req, res) => {
	/*After middleware mods made, only res.send(line 185) is needed
	//req.header gets value, only key is needed
	var token = req.header('x-auth');

	//model method
	User.findByToken(token).then((user) => {
		//if this code runs, so will catch block
		if (!user) {
			return Promise.reject();
		}
		res.send(user);
	}).catch((e) => {
		res.status(401).send();
	});*/
	res.send(req.user);
});

//POST /users/login {email, password}
app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send()
	});
});

//Need to authenticate middleware
app.delete('/users/me/token', authenticate, (req, res) => {
	//returns a promise, respond to user once token deleted
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	})
});

//Read
app.listen(port, () => {
	console.log(`Started up at port ${port}`);
});

module.exports = {app};

