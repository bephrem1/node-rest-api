function filterVoteUpOrDown(req, res, next){
    if(req.params.dir.search(/^(up|down)$/) === -1){
        //Then we know that an invalie param was passed in since it wasn't up or down
        const error = new Error('You must either enter up or down as the last part of \"vote-\"');
        err.status = 404;
        next(err);
    } else {
      req.vote = req.params.dir;
      next();
    }
}

module.exports.filterVoteUpOrDown = filterVoteUpOrDown;
