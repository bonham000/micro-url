var express = require("express");
var app = express();
var path = require('path');
var port = process.env.PORT;
var mongodb = require("mongodb");
var valid = require('url-valid');

var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/micro-url';

var originalUrl = ''; // Intialize variable to store client URL request;

MongoClient.connect(url, function(err, db) {
    
    if (err) {
        console.log("Unable to connect to the mongoDB server, error: " + err);
    }
    else {
        console.log("Connection established to: " + url);    
    
        db.close();
    }
    
})

var insertDocument = function(originalUrl, db, callback) {
    db.collection('addresses').insertOne( {
        "original-url" : originalUrl,
        "micro-url" : "12345"
    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the addresses collection");
        callback();
    });
};

var findAddress = function(micro, db, callback) {

    var cursor = db.collection('addresses').find( );
    cursor.each(function(err, micro) {
        assert.equal(err, null);
        if (micro != null) {
            console.dir(micro);
        }
        else {
            callback();
        }
    });
    
};

app.get('/', function(req, res) {
    
    console.log(req.params);
    res.send("Hello from the server, this is home");
    
});

app.get('*', function(req, res) {
    
    originalUrl = (req.params[0]).slice(1);
    
    // test reqUrl against mongoDB database, if there is a match then redirect, otherwise: else { valid() }  
    if (originalUrl === "this") {
        
        var micro = "12345";
        
        MongoClient.connect(url, function(err, db) {
            
            if(!err) {
        
            var x = db.collection('addresses').find({},{"micro-url":micro, _id:0});
            console.log(x);
            db.close();
            
            }
        
        });
        
        // MongoClient.connect(url, function(err, db) {
        //     assert.equal(null, err);
        //     findAddress(micro, db, function() {
        //         db.close();
        //     });
        // });
        
    }
        
    else {

    valid(originalUrl, function(err, valid) {
        if (err) {
            console.log("There was an error");
        }
        else if (valid === false) {
            console.log("Your url was invalid.");
        }
        else if (valid === true) {
            console.log("Your url is valid; " + valid);

            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                insertDocument(originalUrl, db, function() {
                    db.close();
                });
            });
            
           

            // Assign url a random 5 digit character sequence; insert this as entry in the mongoDB database;
            // Route 
        }    
    });
    
    }
    
    res.send("This is some other page, here is your input: " + originalUrl);
    
});


app.listen(port);
console.log("Server is up...");