var express = require('express');
var bodyParser = require('body-parser');

//server.js is responsible for routes

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

//Read
app.listen(3000, () => {
	console.log('Started on port 3000');
});



