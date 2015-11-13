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

To run the game, please follow the steps in the sections below.
Alternatively, you can check out the live version at
[http://richgieg.github.io/ArcadeGame](http://richgieg.github.io/ArcadeGame).

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

**Connect to the VM via SSH, seed the database, then run the application:**
```
vagrant ssh
cd /vagrant
python seed.py
python application.py
```

**Navigate to the following URL in your browser:**
```
http://localhost:8000
```

----
## Play the Game
This gameplay is quite simple. 


----
## Stop the Web Server
Once you're done playing the game, you can exit your browser and stop the web server.

```
[press Ctrl+C in the terminal to interrupt the web server]
```
