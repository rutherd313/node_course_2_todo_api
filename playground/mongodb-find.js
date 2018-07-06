//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

//connect to the database
MongoClient.connect('mongodb://@localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	} 
	console.log('Connected to MongoDB server');

	/*//access the collection
	db.collection('Todos').find({
		//since id is an object and not a string
		_id: new ObjectID("5b3fa4df4d17019dcaa01bf6")
	}).toArray().then((docs) => {
		console.log('Todos');
		console.log(JSON.stringify(docs, undefined, 2));
	}, (err) => {
		console.log('Unable to fetch todos', err)
	})*/

	/*//access the collection
	db.collection('Todos').find().count().then((count) => {
		console.log(`Todos count: ${count}`);
	}, (err) => {
		console.log('Unable to fetch todos', err)
	});*/

	db.collection('Users').find({
		name: "Leo"
	}).count().then((docs) => {
		console.log(`Todos count: ${docs}`);
		console.log(JSON.stringify(docs, undefined, 2));
	}, (err) => {
		console.log('Unable to fetch todos', err)
	});

	//db.close();
});