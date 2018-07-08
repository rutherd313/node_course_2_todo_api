const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

//Dummy todos = database will still be predictable, looks same at start
//but will have some items in it
const todos = [{
	text: 'First test todo'
}, {
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
	})
})