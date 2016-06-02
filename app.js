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
    
    // Calls to exported function to generate micro-url and return a unique assignment:
    var randomUrl = micro.getMicro();
    
    db.collection('addresses').insertOne( {
        "original-url" : originalUrl,
        "micro-url" : randomUrl
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
        return (doc[0]["original-url"]);
        
    });

};

app.get('/', function(req, res) {
    
    console.log(req.params);
    res.send("Hello from the server, this is home");
    
});

// Add custom paths to micro-urls here for redirects


app.get('*', function(req, res) {
    
    originalUrl = (req.params[0]).slice(1);
    
    // test reqUrl against mongoDB database, if there is a match then redirect, otherwise: else { valid() }  
      
        var micro = new Object();
        micro["micro-url"] = originalUrl;
            
        MongoClient.connect(url, function(err, db) {
            
            if (err) {
                console.log(err);
            }

            db.collection('addresses').find(micro).toArray(function(error, doc) {
            
            console.log(doc)
            console.log(typeof doc);
            console.log(doc[0], doc[1])
            
            if (error) {
                console.log(error);
                testUrl();
            }
            else if (!error) {
                
                if (doc[0] === undefined) {
                    testUrl();
                    return;
                }
                
                console.log("Found this: " + typeof doc + JSON.stringify(doc));
                var redirect = doc[0]["original-url"];
                res.send("Redirecting to: " + redirect);
            }        
        });
        
        });
        
            // MongoClient.connect(url, function(err, db) {
                
            // assert.equal(null, err);
            
            // findAddress(micro, db, function() {
            //     res.redirect();
            //     db.close();
            
        //     });
        // });
        
    
        
    function testUrl() {
    
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
                
            }    
        });
        
    }
    
    
});


app.listen(port);
console.log("Server is up...");