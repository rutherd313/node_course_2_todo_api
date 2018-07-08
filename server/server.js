var express = require('express');
var bodyParser = require('body-parser');

//server.js is responsible for routes
const {ObjectID} = require('mongodb')
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user')

var app = express();

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
	
	


//Read
app.listen(3000, () => {
	console.log('Started on port 3000');
});

module.exports = {app};
