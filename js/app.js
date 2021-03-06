'use strict';

// Global object containing game settings and variables
var Game = {
    // Canvas size
    CANVAS_WIDTH: 505,
    CANVAS_HEIGHT: 606,
    // Size of the game's layout
    NUM_ROWS: 6,
    NUM_COLS: 5,
    // Column and row sizes, in pixels
    COL_WIDTH_IN_PIXELS: 101,
    ROW_HEIGHT_IN_PIXELS: 83,
    // Number of enemies at the start of the game
    NUM_ENEMIES: 3,
    // Score settings
    scoreOffsets: {
        COLLISION: -5000,
        SUCCESS_BASE: 15000,
        SUCCESS_PER_ENEMY: 500,
        TIME_DEDUCTION: -150
    },
    SCORE_TIME_DEDUCTION_INTERVAL: 500,
    // Enumeration of the possible moves the player can make
    playerMoves: {
        LEFT: 0,
        UP: 1,
        RIGHT: 2,
        DOWN: 3
    }
};

// Global "static class" object containing general helper methods
var Helpers = {
    // Get a random integer between the min and max arguments (inclusive)
    getRandomInteger: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    // Convert x and y pixel coordinates to row and column coordinates
    pixelsToRowAndColumn: function(x, y) {
        var yOffset = -45;
        var col = Math.floor(x / Game.COL_WIDTH_IN_PIXELS);
        var row = Math.floor((y + yOffset) / Game.ROW_HEIGHT_IN_PIXELS);
        return {
            row: row,
            col: col
        };
    }
};

// Global "static class" object containing graphics helper methods
var Graphics = (function() {
    var obj = {};

    // Create a hidden canvas to be used by any graphics helper method
    // that requires a rendering surface to perform its duties
    var gfxCanvas = document.createElement('canvas');
    var gfxCtx = gfxCanvas.getContext('2d');

    // Create a hidden img element to be used by getImageFromImageData()
    var gfxImg = document.createElement('img');

    // Private methods:

    // Clears the hidden canvas
    var clearGfxCanvas = function() {
        gfxCtx.clearRect(0, 0, gfxCanvas.width, gfxCanvas.height);
    };

    // Public methods:

    // Get ImageData object for the entire canvas
    obj.getCanvasImageData = function() {
        return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    // Get ImageData object for a sprite
    obj.getSpriteImageData = function(sprite) {
        var image = Resources.get(sprite);
        gfxCanvas.width = image.width;
        gfxCanvas.height = image.height;
        clearGfxCanvas();
        gfxCtx.drawImage(image, 0, 0);
        return gfxCtx.getImageData(0, 0, image.width, image.height);
    };

    // Return an image object that is built using the pixel data from
    // the ImageData argument. WARNING: Any code using this method should
    // immediately render the image to the canvas before the possibility
    // of this method getting called again by other code. The reason being
    // that the same image object will always be returned from this method,
    // with only the src member being updated.
    obj.getImageFromImageData = function(imageData) {
        gfxCanvas.width = imageData.width;
        gfxCanvas.height = imageData.height;
        gfxCtx.putImageData(imageData, 0, 0);
        gfxImg.src = gfxCanvas.toDataURL('image/png');
        return gfxImg;
    };

    // Perform a red-wash effect on an ImageData object
    obj.redFilter = function(imageData) {
        var numPixels = imageData.data.length / 4;
        var i;
        for (i = 0; i < numPixels; i++) {
            var red = imageData.data[i * 4];
            var green = imageData.data[i * 4 + 1];
            var blue = imageData.data[i * 4 + 2];
            var avg = Math.floor((red + green + blue) / 3);
            imageData.data[i * 4] = avg;
            imageData.data[i * 4 + 1] = 0;
            imageData.data[i * 4 + 2] = 0;
        }
        return imageData;
    };

    return obj;
})();

// Static class that defines animations for various transitions, such as
// when the player collides with an enemy or the player reaches the goal
var Transition = (function() {
    var obj = {};

    // Private methods:

    // This transition code applies a stretch effect to the player sprite.
    // If useRedFilter is true, then the sprite turns red.
    var defaultTransition = function(useRedFilter) {
        var playerImageData = Graphics.getSpriteImageData(player.sprite);
        if (useRedFilter) {
            playerImageData = Graphics.redFilter(playerImageData);
        }
        var playerImage = Graphics.getImageFromImageData(playerImageData);
        var w = playerImage.width;
        var h = playerImage.height;
        var x = player.x;
        var y = player.y;
        var rateOfChange = 10;
        return function() {
            ctx.drawImage(playerImage, x, y, w, h);
            w = w + rateOfChange;
            h = h + rateOfChange;
            x = x - (rateOfChange / 2);
            y = y - (rateOfChange / 2);
            if (h >= ctx.canvas.height * 2) {
                return false;
            }
            return true;
        };
    };

    // Public methods:

    // This function is passed by the engine to its renderTransition method
    // when the player collides with an enemy.
    obj.playerHit = function() {
        return defaultTransition(true);
    };

    // This function is passed by the engine to its renderTransition method
    // when the player safely reaches the water.
    obj.playerWins = function () {
        return defaultTransition(false);
    };

    return obj;
})();

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
    this.x = -Game.COL_WIDTH_IN_PIXELS;
    this.y = this.row * Game.ROW_HEIGHT_IN_PIXELS + this.yOffset;

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
    this.rightBoundary = this.x + Game.COL_WIDTH_IN_PIXELS;
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Our player class
var Player = function() {
    // The image/sprite for our player
    this.sprite = 'images/char-boy.png';

    // The player's current score
    this.score = 0;

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
    var move;
    while (this.pendingMoves.length > 0) {
        move = this.pendingMoves.shift();
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

    // Keep player within the boundaries of the game scene
    if (this.col < 0) {
        this.col = 0;
    } else if (this.col > (Game.NUM_COLS - 1)) {
        this.col = Game.NUM_COLS - 1;
    }
    if (this.row < 0) {
        this.row = 0;
    } else if (this.row > (Game.NUM_ROWS - 1)) {
        this.row = Game.NUM_ROWS - 1;
    }

    // Calculate player's pixel position
    this.x = this.col * Game.COL_WIDTH_IN_PIXELS;
    this.y = this.row * Game.ROW_HEIGHT_IN_PIXELS + this.yOffset;

    // Calculate player's current left and right collision boundaries
    this.leftBoundary = this.x + this.boundaryOffset;
    this.rightBoundary = this.x + Game.COL_WIDTH_IN_PIXELS - this.boundaryOffset;
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

// An object of this class keeps track of the player's score
var Score = function() {
    this.value = 0;
};

// Draw the score on the screen
Score.prototype.render = function() {
    ctx.clearRect(0, 0, ctx.canvas.width, 50);
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'white';
    var scoreString = 'Score: ' + this.value;
    ctx.fillText(scoreString, 500, 40);
};

// Handles logic for increasing/decreasing the player's score. The argument
// can be positive or negative.
Score.prototype.offset = function(offset) {
    this.value = this.value + offset;
    // Ensure that the value never goes below 0
    if (this.value < 0) {
        this.value = 0;
    }
};

// Create enemy objects
var allEnemies = [];
var i;
for (i = 0; i < Game.NUM_ENEMIES; i++) {
    allEnemies.push(new Enemy());
}

// Create player object
var player = new Player();

// Create the score object
var score = new Score();

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
