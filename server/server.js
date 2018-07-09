//server.js is responsible for routes

require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb')

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

//Setup the app to use the environment port var that heroku
//is going to set. Will only run on heroku, not run if local
const port = process.env.PORT;

//Getting the body data that got sent from client
app.use(bodyParser.json());

//CreateReadUpdateDelete(CRUD)
//Create
app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

//get('/todos') route 
//returning all of todos
app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos})
	}, (e) => {
		res.status(400).send(e);
	})
});

//Call Get todos with specific id
//url params = :name, this created id var. It will be on the
//req obj, and will be able to access that variable
app.get('/todos/:id', (req, res) => {
	var id = req.params.id
//req.params is an obj with key/value pairs where key is
//the url param(id) & val is on what is placed on id
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	//Quering database
	Todo.findById(id).then((todo) => {
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
app.delete('/todos/:id', (req, res) => {
	var id = req.params.id;
	//validate the id
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	//remove todo by id
	Todo.findByIdAndRemove(id).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		res.status(400).send()
	});
});

//HTTP patch method = used to update a resource
app.patch('/todos/:id', (req, res) => {
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
	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
		if(!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	})
});

//Read
app.listen(port, () => {
	console.log(`Started up at port ${port}`);
});

module.exports = {app};
