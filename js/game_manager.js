function GameManager(){
    // Initializes tetris board, score, and buttons
    this.gridCanvas = document.getElementById('grid-canvas');
    this.nextCanvas = document.getElementById('next-canvas');
    this.scoreContainer = document.getElementById("score-container");
    this.resetButton = document.getElementById('reset-button');
    this.aiButton = document.getElementById('ai-button');

    // Initializes Updater
    this.gravityUpdater = new Updater();
    this.gravityUpdater.skipping = this.aiActive;
    this.gravityUpdater.onUpdate(function(){
        self.applyGravity();
        self.actuate();
    });

    var self = this;

    // Listens for user input
    document.addEventListener("keydown", function (event){
        switch(event.which){
            case 32: //drop
                self.drop();
                self.gravityUpdater.doUpdate(Date.now());
                break;
            case 40: //down
                self.gravityUpdater.doUpdate(Date.now());
                break;
            case 37: //left
                self.moveLeft();
                self.actuate();
                break;
            case 39: //right
                self.moveRight();
                self.actuate();
                break;
            case 38: //up
                self.rotate();
                self.actuate();
                break;
        }
    });

    // User sets if AI is on or not
    this.aiButton.onclick = function(){
        if (self.aiActive){
            self.stopAI();
        }else{
            self.startAI();
        }
    }

    // User resets the gameboard
    this.resetButton.onclick = function(){
        self.setup();
    }


    // Starts the game
    this.setup();
    this.startAI();
    this.gravityUpdater.checkUpdate(Date.now());
};

    // Sets up gameboard
GameManager.prototype.setup = function(){
    this.grid = new Grid(22, 10);
    this.rpg = new RandomPieceGenerator();

    //Sets weights for AI
    this.ai = new AI(0.510066, 0.760666, 0.35663, 0.184483);
    this.currentTetrominos = [this.rpg.nextPiece(), this.rpg.nextPiece()];
    this.currentTetromino = this.currentTetrominos[0];

    this.isOver = true;
    this.score = 0;

    this.stopAI();
    this.actuate();
};

// Updates board and runs game
GameManager.prototype.actuate = function(){
    // Creates a new grid with new piece added
    var _grid = this.grid.clone();
    if (this.currentTetromino != null) {
        _grid.addPiece(this.currentTetromino);
    }

    //Fills Cells
    var context = this.gridCanvas.getContext('2d');
    context.save();
    context.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    for(var r = 2; r < _grid.rows; r++){
        for(var c = 0; c < _grid.columns; c++){
            if (_grid.cells[r][c] == 1){
                context.fillStyle="#FF0000";
                context.fillRect(20 * c, 20 * (r - 2), 20, 20);
                context.strokeStyle="#FFFFFF";
                context.strokeRect(20 * c, 20 * (r - 2), 20, 20);
            }
        }
    }
    context.restore();

    context = this.nextCanvas.getContext('2d');
    context.save();
    context.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    var next = this.currentTetrominos[1];
    var xOffset = next.dimension == 2 ? 20 : next.dimension == 3 ? 10 : next.dimension == 4 ? 0 : null;
    var yOffset = next.dimension == 2 ? 20 : next.dimension == 3 ? 20 : next.dimension == 4 ? 10 : null;
    for(var r = 0; r < next.dimension; r++){
        for(var c = 0; c < next.dimension; c++){
            if (next.cells[r][c] == 1){
                context.fillStyle="#FF0000";
                context.fillRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
                context.strokeStyle="#FFFFFF";
                context.strokeRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
            }
        }
    }
    context.restore();

    this.scoreContainer.innerHTML = this.score.toString();
};

GameManager.prototype.startAI = function(){
    this.aiActive = true;
    this.aiButton.style.backgroundColor = "#e9e9ff";
    this.gravityUpdater.skipping = true;
};

GameManager.prototype.stopAI = function(){
    this.aiActive = false;
    this.aiButton.style.backgroundColor = "#f9f9f9";
    this.gravityUpdater.skipping = false;
};

GameManager.prototype.setcurrentTetromino = function(){
    this.grid.addPiece(this.currentTetromino);
    this.score += this.grid.clearLines();
    if (!this.grid.exceeded()){
        for(var i = 0; i < this.currentTetrominos.length - 1; i++){
            this.currentTetrominos[i] = this.currentTetrominos[i + 1];
        }
        this.currentTetrominos[this.currentTetrominos.length - 1] = this.rpg.nextPiece();
        this.currentTetromino = this.currentTetrominos[0];
        if (this.aiActive) {
            this.aiMove();
            this.gravityUpdater.skipping = true;
        }
    }else{
        alert("Game Over!");
    }
};

// Moves Tetromino down the grid
GameManager.prototype.applyGravity = function(){
    if (this.grid.canMoveDown(this.currentTetromino)) {
        this.currentTetromino.row++;
    }else{
        this.gravityUpdater.skipping = false;
        this.setcurrentTetromino();
    }
};

// Drops current Tetromino to bottom
GameManager.prototype.drop = function(){
    while(this.grid.canMoveDown(this.currentTetromino)){
        this.currentTetromino.row++;
    }
};

GameManager.prototype.moveLeft = function(){
    if (this.grid.canMoveLeft(this.currentTetromino)){
        this.currentTetromino.column--;
    }
};

GameManager.prototype.moveRight = function(){
    if (this.grid.canMoveRight(this.currentTetromino)){
        this.currentTetromino.column++;
    }
};

GameManager.prototype.rotate = function(){
    var offset = this.grid.rotateOffset(this.currentTetromino);
    if (offset != null){
        this.currentTetromino.rotate(1);
        this.currentTetromino.row += offset.rowOffset;
        this.currentTetromino.column += offset.columnOffset;
    }
};

// Runs the Best move based on AI
GameManager.prototype.aiMove = function(){
    this.currentTetromino = this.ai.best(this.grid, this.currentTetrominos, 0).piece;
};
