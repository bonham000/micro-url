var express = require("express");
var app = express();
var path = require('path');
var port = process.env.PORT;
var mongodb = require("mongodb");
var valid = require('url-valid');
var micro = require('./micro.js');
var fs = require('fs');

var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
// server url for local:
// var url = 'mongodb://localhost:27017/micro-url';

// server url for mLab:
var url = 'mongodb://client:clienttest@ds01316.mlab.com:/39684/micro-url';



var originalUrl = ''; // Intialize variable to store client URL request;
var randomUrl = '';

function getRandom() {
    randomUrl = micro.getMicro();
    return randomUrl;
}

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
    // randomUrl = micro.getMicro();
    
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

app.get('/client/css/style.css', function(req, res) {
    res.sendFile(__dirname + '/client/css/style.css');
});

app.get('/client/js/index.js', function(req, res) {
    res.sendFile(__dirname + '/client/js/index.js');
});

app.get('/', function(req, res) {
    
    console.log(req.params);
    res.sendFile(__dirname + '/index.html');
    
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
                //res.send("Redirecting to: " + redirect);
                
                res.redirect(redirect);
                
            }        
        });
        
        });

        
    function testUrl() {
    
        valid(originalUrl, function(err, valid) {
            if (err) {
                console.log("There was an error");
                res.send("An error occurred");
            }
            else if (valid === false) {
                console.log("Your url was invalid.");
                res.send("Your url is invalid or formatted incorrectly.");
            }
            else if (valid === true) {
                console.log("Your url is valid; " + valid);
                
                getRandom();
                
                MongoClient.connect(url, function(err, db) {
                    assert.equal(null, err);
                    insertDocument(originalUrl, db, function() {
                        db.close();
                    });
                });
                    
                res.send("Your url is valid! Here is your short url: " + randomUrl);
                
            };
        });    
    };
        
});
    
    
app.listen(port);
console.log("Server is up...");