//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

//connect to the database
MongoClient.connect('mongodb://@localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	} 
	console.log('Connected to MongoDB server');

	/*db.collection('Todos').findOneAndUpdate({
		_id: new ObjectID("5b3fb7d44d17019dcaa025d9")
	}, {
		$set: {
			completed: true
		}
	}, {
		returnOriginal: false
	}).then((result) => {
		console.log(result);
	})*/

	db.collection('Users').findOneAndUpdate({
		_id: new ObjectID("5b3f9ecb1d232b4468c19269")
	}, {
			$set: {
				name: 'John'
		},	
			$inc: {
				age: 1
			}
		},{
			returnOriginal: false	
		}).then((result) => {
			console.log(result);
		})


	//db.close();
});