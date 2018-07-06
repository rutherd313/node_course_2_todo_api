//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

/*//obj deconstucturing: lets user pull put properties from obj crrating
//variables
var user = {name: 'John', age: 24};
//deconstruct
var {name} = user;
console.log(name);*/

//connect to the database
MongoClient.connect('mongodb://@localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	} 
	console.log('Connected to MongoDB server');

	//adding data to todo collection
	/*db.collection('Todos').insertOne({
		text: 'Something to do',
		completed: false
	}, (err, result) => {
		if (err) {
			return console.log('Unable to insert todo', err);
		}
		//ops atr stores all docs inserted, this case: insertOne
		console.log(JSON.stringify(result.ops, undefined, 2));
	});
*/	
	/*//name, age, location
	db.collection('Users').insertOne({
		name: 'John Dueno',
		age: 24,
		location: 'Chicago',
		fool: false
	}, (err, result) => {
		if (err) {
			return console.log('Unable to insert todo', err);
		}
		console.log(result.ops[0]._id.getTimestamp());
	});*/
	

	db.close();
});