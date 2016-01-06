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
}];

app.get('/',function(req,res){
    res.send('todo api root');
});

app.listen(PORT,function(){
    console.log('express listenning on port ' +  PORT + '!');
});