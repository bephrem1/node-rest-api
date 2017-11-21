'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sortAnswers = function(a, b){
    //- negative if a is to be sorted before b
    //0 no change
    //+ positive if a is to be sorted after b
    if(a.votes === b.votes){
      //votes are the same, now sort by date
      return b.updatedAt - a.updatedAt;
    }
    return b.votes - a.votes;
}

const AnswerSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default: 0}
});

AnswerSchema.method("update", function(updates, callback){ //adding an update method to AnswerSchema
    Object.assign(this, updates, {updatedAt: new Date()}); //Merge the updates into the answer document, the updatedAt passed in 3rd is merged too
    this.parent().save(callback);
});

AnswerSchema.method("vote", function(vote, callback){
    if(vote === "up"){
        this.votes += 1;
    } else {
        this.votes -= 1;
    }
    this.parent().save(callback);
});

const QuestionSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    answers: [AnswerSchema] //Nested Schema
});

QuestionSchema.pre("save", function(next){
    //Answers array will be sorted before every save of the document
    this.answers.sort(sortAnswers);
    next();
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports.Question = Question;
