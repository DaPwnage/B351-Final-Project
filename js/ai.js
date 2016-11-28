function AI(heightScore, linesScore, holesScore, bumpinessScore){
    this.heightScore = heightScore;
    this.linesScore = linesScore;
    this.holesScore = holesScore;
    this.bumpinessScore = bumpinessScore;
};

AI.prototype.best = function(grid, currentTetrominos, currentTetrominosIndex){
    var best = null;
    var bestScore = null;
    var currentTetromino = currentTetrominos[currentTetrominosIndex];

    for(var rotation = 0; rotation < 4; rotation++){
        var _piece = currentTetromino.clone();
        _piece.rotate(rotation);

        while(grid.canMoveLeft(_piece)){
            _piece.column --;
        }

        while(grid.valid(_piece)){
            var _pieceSet = _piece.clone();
            while(grid.canMoveDown(_pieceSet)){
                _pieceSet.row++;
            }

            var _grid = grid.clone();
            _grid.addPiece(_pieceSet);

            var score = null;
            if (currentTetrominosIndex == (currentTetrominos.length - 1)) {
                score = -this.heightScore * _grid.aggregateHeight() + this.linesScore * _grid.lines() - this.holesScore * _grid.holes() - this.bumpinessScore * _grid.bumpiness();
            }else{
                score = this.best(_grid, currentTetrominos, currentTetrominosIndex + 1).score;
            }

            if (score > bestScore || bestScore == null){
                bestScore = score;
                best = _piece.clone();
            }

            _piece.column++;
        }
    }

    return {piece:best, score:bestScore};
};
