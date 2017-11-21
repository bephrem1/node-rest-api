'use strict'

const express = require('express');
const router = express.Router(); //Create router to route requests
const mid = require('../middleware/index');
const Question = require("../models/models.js").Question;

//Run route callback middleware whenever "qId" path param is present
router.param("qId", function(req, res, next, qId){
  Question.findById(qId, function(err, question){
      if (err) return next(err);
      if(!question){
        const error = new Error("Not Found");
        error.status = 404;
        return next(error);
      }
      req.question = question; //Make the foudn document avaliable to other middleware down the chain
      return next();
  });
});

//Run route callback middleware whenever "aId" path param is present
router.param("aId", function(req, res, next, aId){
    req.answer = req.question.answers.id(aId); //req.question is already avaliable from above middleware
    if(!req.answer){
      const error = new Error("Not Found");
      error.status = 404;
      return next(error);
    }
    return next();
});

//All of these routes are relative to /questions so a '/' here means a request to /questions/ basically. Simple.
// GET /questions
//Route for questions collection
router.get('/', function(req, res, next){ //We would have a 'next' in there but this is the likely last stop for a request
    Question.find({})
            .sort({createdAt: -1}) //Documents will be sorted in descending order
            .exec(function(err, questions){
                if(err){
                  return next(err);
                }
                res.json(questions); //It will serialize and stringify the json before sending it out
            });
});

// POST /questions
//Route for creating questions
router.post('/', function(req, res, next){
    const question = new Question(req.body);
    question.save(function(err, question){
        if (err) return next(err);
        res.status(201); //say that document was saved successfully
        res.json(question); //return json to client
    });
});

// GET questions/"qId"
//Route for specific questions
router.get('/:qId', function(req, res, next){
    res.json(req.question);
});

// POST /questions/:qID/answers
//Route for creating an answer
router.post('/:qId/answers', function(req, res, next){
    req.question.answers.push(req.body); //Add an answer to the answers array (push an entry to the end)
    req.question.save(function(err, question){
        if (err) return next(err);
        res.status(201); //say that document was saved successfully
        res.json(question); //return json to client
    });
});

// PUT /questions/:qId/answers/:aId
// Route for editing a specific answer
router.put('/:qId/answers/:aId', function(req, res){
    req.answer.update(req.body, function(err, result){
        if (err) return next(err);
        res.json(result);
    });
});

// DELETE /questions/:qId/answers/:aId
// Route for deleting a specific answer
router.delete('/:qId/answers/:aId', function(req, res){
    req.answer.remove(function(err){
        if (err) return next(err);
        req.question.save(function(err, question){
           if (err) return next(err);
           res.json(question);
        }); //We have removed the answer so we save the parent question to update a list with less answers
    });
});

// POST /questions/:qId/answers/:aId/vote-up
// POST /questions/:qId/answers/:aId/vote-down
// Upvote/Downvote an answer
router.post('/:qId/answers/:aId/vote-:dir', mid.filterVoteUpOrDown, function(req, res){
    req.answer.vote(req.vote, function(err, question){
        if (err) return next(err);
        res.json(question);
    });
});

module.exports = router;
