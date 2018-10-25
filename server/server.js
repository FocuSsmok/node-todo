var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    // console.log(req.body);
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

// GET /todos all todos
app.get('/todos', (req, res) => {

    Todo.find().then((todos) => {
        // console.log(todos);
        res.send({
            todos
        });
    }).catch(e => {
        res.status(400).send(e);
    });
});

// GET /todos/321321
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    // Valid id using isValid
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    } else {
        Todo.findById(id).then((todo) => {
            
            if (!todo) {
                return res.status(404).send();
            }
            res.send(todo);
        }).catch(e => {
            res.status(400).send();
        });
    }
    // 404 send empty send

    // findById
    // succes
    // error
});

app.listen(port, () => {
    console.log('App listening on port ' + port);
});

module.exports = {app};