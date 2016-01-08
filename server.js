var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require("underscore");

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/',function(req,res){
    res.send('todo api root');
});

// GET /todos?completed=true
app.get('/todos',function(req,res){
    var queryParams = req.query;
    var filteredToDos = todos;

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
        filteredToDos  = _.where(filteredToDos, {completed:true});
    }else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
        filteredToDos = _.where(filteredToDos,{completed:false});
    }
   res.json(filteredToDos);
});

//GET /todos/2
app.get('/todos/:id',function(req,res){
    var todoId = parseInt(req.params.id,10);
    // find the todo in the todos array
    var matchedToDo = _.findWhere(todos,{id:todoId});

    if(matchedToDo){
        return res.json(matchedToDo);
    }else
        return res.status(404).send();
});

//POST  /todos/
app.post('/todos', function(req,res){
    var body = _.pick(req.body,'description','completed');
    // use .pick to get only description and completed

    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
        return res.status(400).send();
    }

    // set body.description to be trimmed value
    body.description = body.description.trim();

    body.id = todoNextId++;
    todos.push(body);
    res.json(body);
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
})


app.listen(PORT,function(){
    console.log('express listening on port ' +  PORT + '!');
});
