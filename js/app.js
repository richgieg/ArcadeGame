// Global "static class" containing game settings
var Game = {
    // Number of enemies
    numEnemies: 3,
    // Size of the game's layout
    numRows: 6,
    numCols: 5,
    // Column and row sizes, in pixels
    colWidthInPixels: 101,
    rowHeightInPixels: 83,
    // Enumeration of the possible moves the player can make
    playerMoves: {
        LEFT: 0,
        UP: 1,
        RIGHT: 2,
        DOWN: 3
    }
};

// Global "static class" containing helper methods
var Helpers = {
    // Convert x and y pixel coordinates to row and column coordinates
    pixelsToRowAndColumn: function(x, y) {
        var yOffset = -45;
        var col = Math.floor(x / Game.colWidthInPixels);
        var row = Math.floor((y + yOffset) / Game.rowHeightInPixels);
        return {
            row: row,
            col: col
        };
    },
    // Get a random integer between the min and max arguments (inclusive)
    getRandomInteger: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// Enemy class that represents the enemies our player must avoid
var Enemy = function() {
    // The image/sprite for our enemies
    this.sprite = 'images/enemy-bug.png';

    // Row position
    this.row = 0;

    // The pixel coordinates that define the enemy's position
    this.x = 0;
    this.y = 0;

    // Number of pixels to offset the enemy sprite on the
    // y-axis so that it fits within the designated row
    this.yOffset = -23;

    // Left and right collision boundaries
    this.leftBoundary = 0;
    this.rightBoundary = 0;

    // The enemy's speed factor
    this.speed = 0;
};

// Initialize the enemy's position and speed
Enemy.prototype.initialize = function() {
    // Set the enemy's row
    this.row = Helpers.getRandomInteger(1, 3);

    // Set the enemy's initial position
    this.x = -Game.colWidthInPixels;
    this.y = this.row * Game.rowHeightInPixels + this.yOffset;

    // Set the enemy's speed factor
    this.speed = Helpers.getRandomInteger(100, 400);
};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Calculate the enemy's x position, using time delta
    this.x = this.x + (this.speed * dt);

    // Reinitialize enemy position and speed once it reaches the end
    if (this.x >= ctx.canvas.width) {
        this.initialize();
    }

    // Calculate enemy's current left and right collision boundaries
    this.leftBoundary = this.x;
    this.rightBoundary = this.x + Game.colWidthInPixels;
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Our player class
var Player = function() {
    // The image/sprite for our player
    this.sprite = 'images/char-boy.png';

    // Row and column position
    this.row = 0;
    this.col = 0;

    // The pixel coordinates that define the player's position
    this.x = 0;
    this.y = 0;

    // Number of pixels to offset the player sprite on the
    // y-axis so that it fits within the designated row
    this.yOffset = -35;

    // Left and right collision boundaries
    this.leftBoundary = 0;
    this.rightBoundary = 0;

    // Pixel offset from left and right tile edges where
    // player's contact point begins
    this.boundaryOffset = 30;

    // Pending moves array, used as an input processing queue
    this.pendingMoves = [];
};

// Initialize the player's position
Player.prototype.initialize = function() {
    // Row and column position
    this.row = 5;
    this.col = 2;

    // Clear the pending moves queue
    this.pendingMoves = [];
};

// Update the player's position
Player.prototype.update = function() {
    // Drain the queue while processing each pending move
    while (this.pendingMoves.length > 0) {
        var move = this.pendingMoves.shift();
        switch (move) {
            case Game.playerMoves.LEFT:
                this.col--;
                break;
            case Game.playerMoves.UP:
                this.row--;
                break;
            case Game.playerMoves.RIGHT:
                this.col++;
                break;
            case Game.playerMoves.DOWN:
                this.row++;
                break;
        }
    }

    // Keep player within the boundaries of the game
    if (this.col < 0) {
        this.col = 0;
    } else if (this.col > (Game.numCols - 1)) {
        this.col = Game.numCols - 1;
    }
    if (this.row < 0) {
        this.row = 0;
    } else if (this.row > (Game.numRows - 1)) {
        this.row = Game.numRows - 1;
    }

    // Calculate player's pixel position
    this.x = this.col * Game.colWidthInPixels;
    this.y = this.row * Game.rowHeightInPixels + this.yOffset;

    // Calculate player's current left and right collision boundaries
    this.leftBoundary = this.x + this.boundaryOffset;
    this.rightBoundary = this.x + Game.colWidthInPixels - this.boundaryOffset;
};

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Handle input for the player
Player.prototype.handleInput = function(playerMove) {
    // Add the desired move to the pendingMoves queue, which
    // will be processed in the update method
    if (playerMove !== undefined) {
        this.pendingMoves.push(playerMove);
    }
};

// Static class that defines animations for various transitions, such as
// when the player collides with an enemy or the player reaches the goal
var Transition = {
    playerHit: function() {
        var alpha = 0.001;
        var factor = 1.1;
        // Return the main animation worker function to the engine
        return function() {
            ctx.fillStyle = 'rgba(255, 0, 0, ' + alpha + ')';
            ctx.fillRect(0, 50, ctx.canvas.width, ctx.canvas.height - 70);
            alpha = alpha * factor;
            if (alpha < 0.1) {
                // Tell the engine that we need to render another frame
                return true;
            } else {
                // Tell the engine we're done
                return false;
            }
        }
    },
    playerWins: function () {
        var alpha = 0.001;
        var factor = 1.1;
        // Return the main animation worker function to the engine
        return function() {
            ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            alpha = alpha * factor;
            if (alpha < 0.5) {
                // Tell the engine that we need to render another frame
                return true;
            } else {
                // Tell the engine we're done
                return false;
            }
        }
    }
};

// Create enemy objects
var allEnemies = [];
for (var i = 0; i < Game.numEnemies; i++) {
    allEnemies.push(new Enemy());
}

// Create player object
var player = new Player();

// This listens for key presses and sends desired move to
// the player's handleInput method
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: Game.playerMoves.LEFT,
        38: Game.playerMoves.UP,
        39: Game.playerMoves.RIGHT,
        40: Game.playerMoves.DOWN
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// This listens for touch events on an iPad or other touch-enabled
// device and sends the desired move to the handleInput method
document.addEventListener('touchstart', function(e) {
    // Convert the touch pixel coordinates to row and column values
    var targetTouch = e.targetTouches[0];
    var x = Math.round(targetTouch.clientX - ctx.canvas.offsetLeft);
    var y = Math.round(targetTouch.clientY - ctx.canvas.offsetTop);
    var touch = Helpers.pixelsToRowAndColumn(x, y);

    // Find the difference between the touch row/column values
    // the player's current row/column values
    var rowDiff = touch.row - player.row;
    var colDiff = touch.col - player.col;

    // If a tile is touched, other than the one the player is in, and the
    // tile is in the same column as the player, move vertically
    if (rowDiff && !colDiff) {
        // If the absolute row difference is positive, we move down
        if (rowDiff > 0) {
            player.handleInput(Game.playerMoves.DOWN);
        // Otherwise, we move up
        } else {
            player.handleInput(Game.playerMoves.UP);
        }
    // If a tile is touched, other than the one the player is in, and the
    // tile is in the same row as the player, move horizontally
    } else if (colDiff && !rowDiff) {
        // If the absolute column difference is positive, we move right
        if (colDiff > 0) {
            player.handleInput(Game.playerMoves.RIGHT);
        // Otherwise, we move left
        } else {
            player.handleInput(Game.playerMoves.LEFT);
        }
    }
});