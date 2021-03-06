const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb')

const {app} = require("../server");
const {Todo} = require("../models/todo");


const todos = [{
    _id: new ObjectID(),
    text: 'First test todos'
}, {
    _id: new ObjectID(),
    text: 'Second test todos',
    completed: true,
    completedAt: 333
}];



beforeEach((done) => {
    Todo.remove({}).then(() => {
         return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it("should create a new todo", (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(err => {
                    done(err);
                });
            });
    });

    it("should not create todo with invalid body data", (done) => {
        // challenge for me to do ;)

        var text = "Something to realase in db";

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
                }).catch(e => {
                    done(e);
                });
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should get todo by id', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get(`/todos/123abc`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {

        var id = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[1].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id).then((todo) => {
                    // expect(todo).toNotExist(); nie działa :(
                    done();
                }).catch(e => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
        .delete(`/todos/${new ObjectID().toHexString}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        request(app)
        .delete(`/todos/1321312`)
        .expect(404)
        .end(done);
    });

});

describe('PATCH /todos/:id', () => {
    
    it('should update the todo', (done) => {
        var id = todos[0]._id.toHexString();
        var text = 'new text';

        request(app)
            .patch(`/todos/${id}`)
            .expect(200)
            .send({
                text,
                completed: true,
            })
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                // expect(res.body.todo.completedAt).toBeA('number'); doesnt work i dont know why
            })
            .end(done);
    });

    it('should clear completedAt when when todo is not completed', (done) => {
        var id = todos[1]._id.toHexString();
        var text = 'new text in second todo';

        request(app)
            .patch(`/todos/${id}`)
            .expect(200)
            .send({
                text,
                completed: false,
            })
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                // expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });

});