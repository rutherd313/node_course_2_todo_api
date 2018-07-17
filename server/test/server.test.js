const _ = require('lodash')
const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');
const {User} = require('./../models/user');

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
		.set('x-auth', users[0].tokens[0].token)
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
		.set('x-auth', users[0].tokens[0].token)
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
			.set('x-auth', users[0].tokens[0].token)
			//make assertions on what comes back
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(1);
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
			.set('x-auth', users[0].tokens[0].token)
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

	it('should not return todo doc created by other user', (done) => {
		request(app)
			.get(`/todos/${todos[1]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {
		var hexId = new ObjectId().toHexString();
		request(app)
			.get(`/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	})

	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get('/todos/123abc')
			.set('x-auth', users[0].tokens[0].token)
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
			//authenticate as second user who has access
			//to second to-do
			.set('x-auth', users[1].tokens[0].token)
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

	//Verifies that if id is deleted that isn't owned, it
	//shouldn't get removed

	//second todo is deleted instead of the first as the
	//second user(line 171) which should cause an error 
	it('should remove a todo', (done) => {
		var hexId = todos[0]._id.toHexString();

		request(app)
			.delete(`/todos/${hexId}`)
			//authenticate as second user who has access
			//to second to-do
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexId).then((todo) => {
					expect(todo).toBeTruthy();
					done();
				}).catch((e) => done(e));
			});
	});

	it('should return 404 if todo not found', (done) => {
		var hexId = new ObjectId().toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});

	it('should return 404 if object id is invalid', (done) => {
		request(app)
			.delete('/todos/123abc')
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		var hexId = todos[0]._id.toHexString();
		//update text, set it to watever & set completed = T
		var text = 'This should be the new text';
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
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

	//second copy
	it('should not update the todo created by other user', (done) => {
		var hexId = todos[0]._id.toHexString();
		//update text, set it to watever & set completed = T
		var text = 'This should be the new text';
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			//what is changed
			.send({
				completed: true,
				text
			})
			.expect(404)
			.end(done);
	});


	it('should clear completedAt when todo is not completed', (done) => {
		//grab id of second todo item
		var hexId = todos[1]._id.toHexString();
		//update text, set completed to false	
		var text = 'This should be the new text!!'
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
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

//Test cases
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
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

//Test cases for sign up route
describe('POST /users', () => {
	it('should create a user', (done) => {
		var email = 'example@example.com';
		var password = 'randompass';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body._id).toBeTruthy();
				expect(res.body.email).toBe(email);
			})
			//custom end
			.end((err) => {
				if(err) {
					return done(err);
				}
			User.findOne({email}).then((user) => {
				expect(user).toBeTruthy();
				expect(user.password).not.toBe(password);
				done();
			}).catch((e) => done(e));
		});
	});

	it('should return validation errors if request invalid', (done) => {
		request(app)
			.post('/users')
			.send({
				email: 'and',
				password: '123'
			})
			.expect(400)
			.end(done)
	});

	it('should not create user if email is already in use', (done) => {
		request(app)
			.post('/users')
			.send({
				email: users[0].email,
				password: 'password123!'
			})
			.expect(400)
			.end(done);
	})
});

describe('POST /users/login', () => {
	it('should login user and return auth token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password
			})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
			User.findById(users[1]._id).then((user) => {
				expect(user.tokens[1]).toMatchObject({
					access: 'auth',
					token: res.headers['x-auth']
				});
				done();
			}).catch((e) => done(e));
		});
	});

	it('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password + '1'
			})
			.expect(400)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeFalsy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
			User.findById(users[1]._id).then((user) => {
				expect(user.tokens.length).toBe(1);
				done();
			}).catch((e) => done(e));
		});
	});
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', (done) => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}

			//Query the database
			User.findById(users[0]._id).then((user) => {
				expect(user.tokens.length).toBe(0);
				done();
			}).catch((e) => done(e));
		});
	});
});
















