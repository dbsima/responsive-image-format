# New Responsive Image Format

## Requirements

* rethinkdb
* python
* python-flask

## Installation (Mac OS X >= 10.7)

### Install RethinkDB
v1.12.4 - The Wizard of Oz (Make sure you have Homebrew installed)
```shell
brew update && brew install rethinkdb
```
### Clone & install Python drivers (2.x)
```shell
git clone git@git.corp.adobe.com:sdragos/responsive-image-format.git
sudo pip install Flask
sudo pip install passlib
sudo pip install Flask-HTTPAuth
sudo pip install rethinkdb
```
### Encoder/Decoder
#### Dependencies
* libjpeg
* libzlib
* libwebp
* PIL

#### libwebp
```shell
sudo port selfupdate
sudo port install webp
```
##### Test libwebp
* png to webp
```shell
cwebp -q 80 image.png -o image.webp
```
* webp to png
```shell
dwebp image.webp -o image.png
```

#### PIL
* get source code from https://pypi.python.org/pypi/Pillow/2.4.0#downloads
* unzip it and go into dir
```shell
sudo CFLAGS=-Wunused-command-line-argument-hard-error-in-future python setup.py install
```

## Running the application

Run RethinkDB server in a tab of the terminal
```shell
rethinkdb
```
Create database and tables in another tab
```shell
cd responsive-image-format
python server.py --setup
```
Run app
```shell
python server.py
```
Go to http://localhost:6003/ in a browser (tested on Safari 7 and Chrome 34 in Mac OS 10.9.2), sign up and have fun.

You can now visit http://localhost:8080/ to see the RethinkDB web admin.
