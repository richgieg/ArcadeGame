var gameIsRunning = false;

// Globally define the size of the game map
var level = {
    numRows: 6,
    numCols: 5
}

// Globally define the background tile width and height
var tile = {
    width: 101,
    height: 83
};

// Enum of possible moves for the player
var playerMoves = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3
};

// Convert x and y pixel coordinates to row and column coordinates
var pixelsToRowAndColumn = function(x, y) {
    var yOffset = -45;
    var col = Math.floor(x / tile.width);
    var row = Math.floor((y + yOffset) / tile.height);
    return {
        row: row,
        col: col
    };
};

// Get a random integer between the min and max arguments (inclusive)
var getRandomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Enemies our player must avoid
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

    // Set the enemy's starting position and speed
    // this.initialize();
};

// Initialize the enemy's position and speed
Enemy.prototype.initialize = function() {
    // Set the enemy's row
    this.row = getRandomInteger(1, 3);

    // Set the enemy's initial position
    this.x = -tile.width;
    this.y = this.row * tile.height + this.yOffset;

    // Set the enemy's speed factor
    this.speed = getRandomInteger(100, 400);
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
    this.rightBoundary = this.x + tile.width;
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

    // Initialize the player's position
    // this.initialize();
};

// Initialize the player's position
Player.prototype.initialize = function() {
    // Row and column position
    this.row = 5;
    this.col = 2;
};

// Update the player's position
Player.prototype.update = function() {
    // Drain the queue while processing each pending move
    while (this.pendingMoves.length > 0) {
        var move = this.pendingMoves.shift();
        switch (move) {
            case playerMoves.LEFT:
                this.col--;
                break;
            case playerMoves.UP:
                this.row--;
                break;
            case playerMoves.RIGHT:
                this.col++;
                break;
            case playerMoves.DOWN:
                this.row++;
                break;
        }
    }

    // Keep player within the boundaries of the game
    if (this.col < 0) {
        this.col = 0;
    } else if (this.col > (level.numCols - 1)) {
        this.col = level.numCols - 1;
    }
    if (this.row < 0) {
        this.row = 0;
    } else if (this.row > (level.numRows - 1)) {
        this.row = level.numRows - 1;
    }

    // Calculate player's pixel position
    this.x = this.col * tile.width;
    this.y = this.row * tile.height + this.yOffset;

    // Calculate player's current left and right collision boundaries
    this.leftBoundary = this.x + this.boundaryOffset;
    this.rightBoundary = this.x + tile.width - this.boundaryOffset;
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

// Create enemy objects
var allEnemies = [];
for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy());
}

// Create player object
var player = new Player();

// This listens for key presses and sends desired move to
// the player's handleInput method
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: playerMoves.LEFT,
        38: playerMoves.UP,
        39: playerMoves.RIGHT,
        40: playerMoves.DOWN
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
    var touch = pixelsToRowAndColumn(x, y);

    // Find the difference between the touch row/column values
    // the player's current row/column values
    var rowDiff = touch.row - player.row;
    var colDiff = touch.col - player.col;

    // If a tile is touched, other than the one the player is in, and the
    // tile is in the same column as the player, move vertically
    if (rowDiff && !colDiff) {
        // If the absolute row difference is positive, we move down
        if (rowDiff > 0) {
            player.handleInput(playerMoves.DOWN);
        // Otherwise, we move up
        } else {
            player.handleInput(playerMoves.UP);
        }
    // If a tile is touched, other than the one the player is in, and the
    // tile is in the same row as the player, move horizontally
    } else if (colDiff && !rowDiff) {
        // If the absolute column difference is positive, we move right
        if (colDiff > 0) {
            player.handleInput(playerMoves.RIGHT);
        // Otherwise, we move left
        } else {
            player.handleInput(playerMoves.LEFT);
        }
    }
});