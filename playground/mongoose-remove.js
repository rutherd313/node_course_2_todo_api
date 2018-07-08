const {ObjectID} = require('mongodb')

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//Mongoose allows three ways to delete methods

//Method 1
/*Todo.remove({}).then((result) => {
	console.log(result);
})*/

//Method 2
/*Todo.findOneAndRemove({_id: '5b4279e94d17019dcaa14cfa'}).then((todo) => {
	
})*/


//Method 3
Todo.findByIdAndRemove('5b4279e94d17019dcaa14cfa').then((todo) => {
	console.log(todo)
});