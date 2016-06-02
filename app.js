var express = require("express");
var app = express();
var port = process.env.PORT;


app.get('/', function(req, res) {
    
    res.send("Hello from the server");
    
});



app.listen(port);
console.log("Server is up...");