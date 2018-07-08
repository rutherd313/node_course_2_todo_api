const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

//Dummy todos = database will still be predictable, looks same at start
//but will have some items in it
const todos = [{
	//id is auto generated, so force create it
	//can access id from test case
	_id: new ObjectId(),
	text: 'First test todo'
}, {
	_id: new ObjectId(),
	text: 'Second test todo'
}];

//assumes expect(todos.length).toBe(1) starts at 0, so to correct
//code runs before every test case, in this case, make sure database
//is empty before each request
beforeEach((done) => {
	//remove wipes out all of todos
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => done());
	/*old syntax
	Todo.remove({}).then(() => {
		done();
	})*/
});

describe('POST /todos', () => {
	//async test, therefore (done)
	it('should create a new todo', (done) => {
		var text = 'test todo text';

		//POST request
		request(app)
		.post('/todos')
		.send({text})
		//assertions
		.expect(200)
		.expect((res) => {
			expect(res.body.text).toBe(text);
		})
		.end((err, res) => {
			if (err) {
				return done(err);
			}
			Todo.find({text}).then((todos) => {
				expect(todos.length).toBe(1)
				expect(todos[0].text).toBe(text);
				done();
			}).catch((e) => done(e));
		});
	});
	//Test case that verifies that a todo does not
	//get created when bad data is sent
	it('should not create todo with invalid data', (done) => {
		request(app)
		.post('/todos')
		.send({})
		.expect(400)
		.end((err, res) => {
			if (err) {
				return done(err);
			}
			Todo.find().then((todos) => {
				expect(todos.length).toBe(2);
				done();
			}).catch((e) => done(e));
		});
	});
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			//make assertions on what comes back
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	//test case to see if valid id is passed, doc comes
	//back
	it('should return todo doc', (done) => {
		request(app)
		//id come from line 13 
		//convert obj id into string: toHexString()
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			//verify body that comes back matches the body
			//line 14
			.expect((res) => {
				//line 55 server.js must match todo prop
				//to the first todo (line 98) 
				expect(res.body.todo.text).toBe(todos[0].text)
			})
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {
		var hexId = new ObjectId().toHexString();
		request(app)
			.get(`/todos/${hexId}`)
			.expect(404)
			.end(done);
	})

	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get('/todos/123abc')
			.expect(404)
			.end(done);
	});
});

//Test cases(it) to verify app.delete route works from server.js
describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		var hexId = todos[1]._id.toHexString();

		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexId).then((todo) => {
					expect(todo).toBeNull();
					done();
				}).catch((e) => done(e));
			});
	});

	it('should return 404 if todo not found', (done) => {
		var hexId = new ObjectId().toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if object id is invali', (done) => {
		request(app)
			.delete('/todos/123abc')
			.expect(404)
			.end(done);
	});
});