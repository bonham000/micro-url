var express = require("express");
var app = express();
var path = require('path');
var port = process.env.PORT;
var mongodb = require("mongodb");
var valid = require('url-valid');
var micro = require('./micro.js');

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
    
    var randomUrl = micro.getMicro();
    
    db.collection('addresses').insertOne( {
        "original-url" : originalUrl,
        "micro-url" : randomUrl // Generate and insert custom micro URL here
    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the addresses collection");
        callback();
    });
};

var findAddress = function(micro, db, callback) {

    db.collection('addresses').find(micro).toArray(function(error, doc) {
        
        if (error) {
            console.log(error);
        }
        
        console.log("Found this: " + JSON.stringify(doc));
        // doc.forEach(function(data) {
        //     console.log(JSON.stringify(doc));
        // });
        
    });


    // var cursor = db.collection('addresses').find( );
    // cursor.each(function(err, micro) {
    //     assert.equal(err, null);
    //     if (micro != null) {
    //         console.dir(micro);
    //     }
    //     else {
    //         callback();
    //     }
    // });
    
};

app.get('/', function(req, res) {
    
    console.log(req.params);
    res.send("Hello from the server, this is home");
    
});

// Add custom paths to micro-urls here for redirects

app.get('*', function(req, res) {
    
    originalUrl = (req.params[0]).slice(1);
    
    // test reqUrl against mongoDB database, if there is a match then redirect, otherwise: else { valid() }  
    if (originalUrl === "this") {
        
        var micro = new Object();
        micro["micro-url"] = "2468";
        
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            findAddress(micro, db, function() {
                db.close();
            });
        });
        
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