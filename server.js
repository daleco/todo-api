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

// GET /todos
app.get('/todos',function(req,res){
   res.json(todos);

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
    var body = req.body;

    if(_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
        return res.status(400).send();
    }
    body.id = todoNextId++;
    todos.push(body);

    console.log('description ' + body.description);
    res.json(body);
});

app.listen(PORT,function(){
    console.log('express listening on port ' +  PORT + '!');
});