var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db.js');
var bcrypt = require('bcrypt');

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/',function(req,res){
    res.send('todo api root');
});

// GET /todos?completed=true&q=work
app.get('/todos',function(req,res){
    var query = req.query;
    var where ={};
    if(query.hasOwnProperty('completed') && query.completed === 'true')
        where.completed =true;
    else if(query.hasOwnProperty('completed') && query.completed === 'false')
            where.completed = false;

    if(query.hasOwnProperty('q') && query.q.length>0){
        where.description = {
                $like: '%'+query.q+'%'
            }
    }

    db.todo.findAll({where :  where}).then(function(todos){
        return res.json(todos);
    }, function(e){
        return res.status(500).send();
    });
});

//GET /todos/2
app.get('/todos/:id',function(req,res){
    var todoId = parseInt(req.params.id,10);
    // find the todo in the todos array
    db.todo.findById(todoId).then(function(todo){
        if(!!todo)
            return res.json(todo.toJSON());
        else
            return res.status(400).send();
    }, function(e){
        return res.status(500).send();
    });

});

//POST  /todos/
app.post('/todos', function(req,res){
    var body = _.pick(req.body,'description','completed');
    // use .pick to get only description and completed
    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    }, function(e){
        return res.status(400).json(e);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id',function(req,res){
    var idToDo = parseInt(req.params.id,10);

    db.todo.destroy({
        where:{id:idToDo}
    }).then(function(todo){
        if(todo>0)
            res.status(204).send();
        else
            return res.status(400).json({ error:'No To with id'});
    }, function(e){
        return res.status(500).send();
    });
});

// /PUT/todos/:id
app.put('/todos/:id', function(req,res){
    var idToDo = parseInt(req.params.id,10);
    var body = _.pick(req.body,'description','completed');
    var attributes = {};

    if(body.hasOwnProperty('completed')){
        attributes.completed = body.completed;
    }

    if(body.hasOwnProperty('description')){
        attributes.description = body.description;
    }

    db.todo.findById(idToDo).then(function(todo){
        if(todo){
            todo.update(attributes).then(function(todo){
                res.json(todo)
            }).then(function(e){
                res.status(400).json(e);
            })
        }else{
            res.status(404).send();
        }
    }, function(){
        res.status(500).send();
    });

});

app.post('/users', function(req,res){
    var body = _.pick(req.body,'email','password');
    db.user.create(body).then(function(user){
        res.json(user.toPublicJSON());
    }, function(e){
        return res.status(400).json(e);
    });

});

// POST /users/login
app.post('/users/login', function(req,res){
    var body = _.pick(req.body,'email','password');

    db.user.authenticate(body).then(function(user){
        var token = user.generateToken('authentication');
        if(token)
            res.header('Auth',token).json(user.toPublicJSON());
        else res.status(401).send();
    }, function(){
        res.status(401).send();
    });

})

db.sequelize.sync().then(function(){
    app.listen(PORT,function(){
        console.log('express listening on port ' +  PORT + '!');
    });
});


