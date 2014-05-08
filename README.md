New Responsive Image Format
==================

Requirements
------------
* rethinkdb
* python
* python-flask

Installation (Mac OS X)
----------------------
Install RethinkDB (Make sure you're on OS X Lion or above (>= 10.7) and have Homebrew installed)
```shell
brew update && brew install rethinkdb
```
Clone & install Python drivers (2.x)
```shell
git clone git@git.corp.adobe.com:sdragos/responsive-image-format.git
sudo pip install Flask
sudo pip install rethinkdb
```
Running the application
-----------------------
Run RethinkDB server
```shell
rethinkdb
```
Create database and tables
```shell
cd responsive-image-format
python server.py --setup
```
Run app
Create database and tables
```shell
python server.py
```
Go to http://localhost:6003/ in a browser (tested on Safari 7 and Chrome 34 in Mac OS 10.9.2), sign up and have fun. 

You can now visit http://localhost:8080/ to see the RethinkDB web admin.
