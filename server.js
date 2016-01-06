var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000
var todos = [{
    id: 1,
    description: 'meet X for brunch',
    completed: false
},{
    id:2,
    description: 'go to market',
    completed: false
},{
    id:3,
    description: 'feed',
    completed: true
}];

app.get('/',function(req,res){
    res.send('todo api root');
});

// GET /todos
app.get('/todos',function(req,res){
   res.json(todos);

});

//GET /todos/2
app.get('/todos/:id',function(req,res){
    var todoId = parseInt(req.params.id);
    todos.forEach(function(todo){
        if(todo.id === todoId){
            return res.json(todo);
        }
    })
    return res.status(404).send();
});

app.listen(PORT,function(){
    console.log('express listenning on port ' +  PORT + '!');
});