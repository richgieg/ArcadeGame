// Globally define the tile width and height in order to
// prevent the need to hard-code magic numbers in various
// places.
var tile = {
    width: 101,
    height: 83
};

// Enemies our player must avoid
var Enemy = function() {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // The coordinates that define the enemy's position
    this.x = 0;
    this.y = 0;

    // The enemy's speed factor
    this.speed = 0;

    // Set the enemy's starting position and speed
    this.initialize();
};

// Initialize the enemy's position and speed
Enemy.prototype.initialize = function() {
    // A random value from 0 to 2
    var row = 0;

    // Number of pixels to offset the enemy sprite on the
    // y-axis so that it fits within the designated row
    var yOffset = 60;

    // Set the enemy's initial position
    this.x = -tile.width;
    this.y = row * tile.height + yOffset;

    // A random value from 100 to 500
    this.speed = 100;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + (this.speed * dt);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy()];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
