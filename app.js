var express = require("express");
var app = express();
var path = require('path');
var port = process.env.PORT;
var mongodb = require("mongodb");
var valid = require('url-valid');

var nano = require("nano")(port);
nano.db.create("addresses");
var addresses = nano.db.use("addresses");

addresses.insert({"original url": "www.example.com", "micro url": "12345"});

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/micro-url';

var reqUrl = ''; // Intialize variable to store client URL request;

MongoClient.connect(url, function(err, db) {
    
    if (err) {
        console.log("Unable to connect to the mongoDB server, error: " + err);
    }
    else {
        console.log("Connection established to: " + url);    
    
        db.close();
    }
    
})

app.get('/', function(req, res) {
    
    console.log(req.params);
    res.send("Hello from the server, this is home");
    
});

app.get('*', function(req, res) {
    
    reqUrl = (req.params[0]).slice(1);
    
    console.log(reqUrl);
    
    // test reqUrl against mongoDB database, if there is a match then redirect, otherwise: else { valid() }  

    valid(reqUrl, function(err, valid) {
        if (err) {
            console.log("There was an error");
        }
        else if (valid === false) {
            console.log("Your url was invalid.");
        }
        else if (valid === true) {
            console.log("Your url is valid; " + valid);
            addresses.save( { "original url" : reqUrl, "micro url" : "12345" } );
            console.log("inserted");
            
            // Assign url a random 5 digit character sequence; insert this as entry in the mongoDB database;
            // Route 
        }    
    });
    
    res.send("This is some other page, here is your input: " + reqUrl);
    
});


app.listen(port);
console.log("Server is up...");