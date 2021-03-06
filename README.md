# Arcade Game

This is the third project in my pursuit of the Front-End Web Developer
Nanodegree from Udacity. Following is Udacity's description for this project:

"You will learn JavaScript’s object-oriented programming features to write
eloquently designed classes capable of creating countless instances of similarly
functioning objects. You will discover a variety of ways inheritance and
delegation can be used to create well architected and performant applications.
Games have a lot of objects and those objects do a lot of different things; but
sometimes those objects do some very similar things as well. This creates a
great opportunity to practice object-oriented programming, an important
programming paradigm that influences your application architecture as well as
provides performance optimizations."

To play the game, check out the live version at
[http://www.richgieg.com/arcade-game](http://www.richgieg.com/arcade-game). If
you would like to host the game on your own system, please see the sections
that come after the gameplay instructions below.

----
## Playing the Game
The goal of this game is to get your character to the water. Sounds simple, right?
Well, it's not quite that easy... You see, there are bugs moving at varying speeds
on the paved-block portion of the scene. If you collide with a bug, your character
will be moved back to the original starting position and your score will be reduced.
On the other hand, each time you make it to the water safely your score will be increased
generously. But, immediately after the short celebration a new bug will be spawned in order to make your
next trip to the water a bit more challenging. Let's see how high of a score you can get, shall we?

**Controls:**

If you're playing the game on a computer with a keyboard, you can move your character
by using the `UP`, `DOWN`, `LEFT` and `RIGHT` arrow keys. These are the only keys you
need to worry about for playing this game.

If you're using a touchscreen device, such as an iPad, you can tap directly on your
screen to move your character. To move `UP`, touch a tile above your
character, but in the same column. To move `DOWN`, touch a tile below
your character, but in the same column. To move `LEFT`, touch a tile to the left of
your character, but in the same row. To move `RIGHT`, touch a tile to
the right of your character, but in the same row. These are the only movements
you need to worry about for playing this game.

**Scoring system:**

Reach the water: `+15000` points and `+500` points per bug

Collide with bug: `-5000` points

Half a second of time passes: `-150` points


```


```
----
*The sections that follow are only necessary if you are trying to host the game on your system.*


----
## Install a Web Server
Due to the game's usage of certain JavaScript canvas functions, it will not operate successfully when run from the filesystem. You will need some form of web server in order to host the game. I recommend installing Python on your system, if you don't have it already. Python includes a module called SimpleHTTPServer that allows you to easily serve HTML files on your local system.

----
## Run the Game
Use a command line terminal for the following steps. This guide assumes you will use Python's SimpleHTTPServer module to host the game.

**Clone the repository to your local system, then launch the web server:**
```
git clone https://github.com/richgieg/ArcadeGame.git
cd ArcadeGame
python -m SimpleHTTPServer
```

*You should see a message similar to ```"Serving HTTP on 0.0.0.0 port 8000"``` in your terminal.*

**Use a browser to connect to your web server:**

1. Open your favorite browser

2. Navigate to ```http://localhost:8000```

*At this point, the game should be loaded in your browser and ready to play.*

----
## Stop the Web Server
Once you're done playing the game, you can exit your browser and stop the web server.

```
[press Ctrl+C in the terminal to interrupt the web server]
```
