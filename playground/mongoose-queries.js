//http://mongoosejs.com/docs/queries.html

//load-in obj id from mongodb driver to check if id is valid
const {ObjectID} = require('mongodb')

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//used for all the quering
var userId = '5b411833b6006f498861c69c';
/*var id = '5b4165d0f32ee34f34bd6421';


if (!ObjectID.isValid(id)) {
	console.log('ID not valid');
};
*/
/*Todo.find({
	_id: id
}).then((todos) => {
	console.log('Todos', todos);
});

Todo.findOne({
	_id: id
}).then((todo) => {
	console.log('Todo', todo);
});*/

/*Todo.findById(id).then((todo) => {
	//handling err if id does not match database id
	if (!todo) {
		return console.log('Id not found');
	}
	console.log('Todo By Id', todo);
}).catch((e) => console.log(e));//how to validate obj id
*/
//---Assignment---
User.findById(userId).then((user) => {
	if (!user) {
		return console.log('User id not found');
	}
	console.log('User By Id', user);
}).catch((e) => console.log(e));