const _ = require('lodash')
const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed'); 

beforeEach(populateUsers);
beforeEach(populateTodos);

//assumes expect(todos.length).toBe(1) starts at 0, so to correct
//code runs before every test case, in this case, make sure database
//is empty before each request
/*beforeEach((done) => {
	//remove wipes out all of todos
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => done());
	// old syntax
	// Todo.remove({}).then(() => {
	// 	done();
	// })
});*/

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

	it('should return 404 if object id is invalid', (done) => {
		request(app)
			.delete('/todos/123abc')
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		var first_id = todos[0]._id.toHexString();
		//update text, set it to watever & set completed = T
		var text = 'This should be the new text';
		request(app)
			.patch(`/todos/${first_id}`)
			//what is changed
			.send({
				completed: true,
				text
			})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(text);
				//assertions bout completed property
				expect(res.body.todo.completed).toBe(true);
				//asserion bout completedAt, must be a num
				expect(res.body.todo.completedAt).toBeGreaterThan(0);
			})
			.end(done)

	});

	it('should clear completedAt when todo is not completed', (done) => {
		//grab id of second todo item
		var second_id = todos[1]._id.toHexString();
		//update text, set completed to false	
		var text = 'This should be the new text!!'
		request(app)
			.patch(`/todos/${second_id}`)
			.send({
				completed: false,
				text
			})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(text);
				//assertions bout completed property
				expect(res.body.todo.completed).toBe(false);
				//asserion bout completedAt, must be a num
				expect(res.body.todo.completedAt).toBeNull();
			})
			.end(done)
	});
});


//Route that returns aeach authenticated user
describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			//setting header in supertest
			.set('x-auth', users[0].tokens[0].token)
			//assertions
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should return 401 if not authenticated', (done) => {

	});
})