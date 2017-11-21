'use strict'

const express = require('express');
const app = express();
const routes = require('./routes/routes.js');
const jsonParser = require('body-parser').json; //create json parser off of body-parser module
const logger = require('morgan');
const mongoose = require('mongoose');

app.use(logger("dev")); //Configures middleware to give colorful status codes in console upon requests
app.use(jsonParser()); //Use jsonParser's returned middleware on each request

//Setup Mongodb connection and handlers
mongoose.connect("mongodb://localhost:27017/qa");
const db = mongoose.connection;
db.on("error", function(err){
    console.log(err);
});
db.once("open", function(){
    console.log("DB connection successful!");
});

//IMPORTANT: This code below allows for Cross Origin Resource Sharing (CORS) to prevent blocking of API responses by browser
//Because requests to different origins is NOT ALLOWED unless we explicitly allow it here on our server
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*"); //Means: "It's ok to make a request to this API from any domain"
    res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept"); //Specify allowed headers

    if(req.method === "OPTIONS"){
      res.header("Access-Control-Allow-Methods", "PUT,POST,DELETE"); //Specify what methods are allowed (besides GET of course)
      return res.status(200).json({});
    }
    next();
});

app.use("/questions", routes); //Preface any routes in the conext of /questions

//Catch 404 errors and forward to error handler
app.use(function(req, res, next){
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

//Error handler
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.json({
      error: {
        message : err.message
      }
    });
});

const port = process.env.PORT || 3000; //Default to port 3000 unless application is deployed
app.listen(port, function(){
  console.log('Express server is listening on port', port);
}); //Listen on port for incoming requests, 2nd param is function called once server starts listening for requests
