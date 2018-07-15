var mongoose = require('mongoose')

//Mongoose schema
var Todo = mongoose.model('Todo', {
	text: {
		type: String,
		required: true, //These values must exist
		minlength: 1,
		trim: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	completedAt: {
		type: Number,
		default: null
	},
	//store id of user who created the todo, makes sure user
	//has access to manage this data
	// _ => obj id
	_creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	}
});

 module.exports = {Todo};


 
/*var newTodo = new Todo({
	text: 'Cook dinner'
});

//Saving todo to the database
newTodo.save().then((doc) => {
	console.log('Saved todo', doc);
}, (e) => {
	console.log('Unable to save todo')
});*/

//----2nd----
/*var newTodo1 = new Todo({
//if value of text is num or boolean, it will get converted into string
	text: ' Someting to do  '
});

newTodo1.save().then((doc) => {
	console.log(JSON.stringify(doc, undefined, 2));
}, (e) => {
	console.log('Unable to save todo1');
})*/