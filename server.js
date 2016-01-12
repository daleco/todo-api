var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db.js');

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
    var matchToDo = _.findWhere(todos,{id:idToDo});
    if(!matchToDo)
        res.status(400).send();
    else {
        todos = _.without(todos, matchToDo);
        res.json(matchToDo);
    }
});

// /PUT/todos/:id
app.put('/todos/:id', function(req,res){
    var idToDo = parseInt(req.params.id,10);
    var matchToDo = _.findWhere(todos,{id:idToDo});
    var body = _.pick(req.body,'description','completed');
    var validAttributes = {};

    if(!matchToDo) return res.status(404).send();

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;
    }else if(body.hasOwnProperty('completed')){
            return res.status(400).send();
        }else{

        }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length >0){
        validAttributes.description = body.description;
    }else if(body.hasOwnProperty('description')){
        return res.status(400).send();
    }

    _.extend(matchToDo,validAttributes);
    res.json(matchToDo);
});

db.sequelize.sync().then(function(){
    app.listen(PORT,function(){
        console.log('express listening on port ' +  PORT + '!');
    });
});


