from flask import Flask, url_for, json, jsonify, g, request, Response, render_template, make_response, send_from_directory, abort, session, flash, redirect
from util import make_json_response, make_error_response, bad_id_response
from werkzeug.utils import secure_filename

import argparse
import json
import os

import string
import random

import shutil

import rethinkdb as r
from rethinkdb.errors import RqlRuntimeError, RqlDriverError

#### Connection details

# We will use these settings later in the code to connect to the
# RethinkDB server.
RDB_HOST =  os.environ.get('RDB_HOST') or 'localhost'
RDB_PORT = os.environ.get('RDB_PORT') or 28015
MY_DB = 'mydb'

# Where will the uploaded files be stored
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(APP_ROOT, 'static/uploads')
# Set of allowed file extensions
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

#### Setting up the app database

# The app will use the tables `users` and `files` in the database specified by the
# `MY_DB` variable.  We'll create the database and table here using
# [`db_create`](http://www.rethinkdb.com/api/python/db_create/)
# and
# [`table_create`](http://www.rethinkdb.com/api/python/table_create/) commands.
def dbSetup():
    connection = r.connect(host=RDB_HOST, port=RDB_PORT)
    try:
        r.db_create(MY_DB).run(connection)
        r.db(MY_DB).table_create('users', primary_key='email').run(connection)
        r.db(MY_DB).table_create('files').run(connection)
        r.db(MY_DB).table_create('assets').run(connection)
        r.db(MY_DB).table_create('layers').run(connection)
        print 'Database setup completed. Now run the app without --setup.'
    except RqlRuntimeError:
        print 'App database already exists. Run the app without --setup.'
    finally:
        connection.close()


app = Flask(__name__)
# set maximum allowed payload to 16 megabytes (RequestEntityTooLarge exception)
#app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config.from_object(__name__)
app.config.update(dict(
    SECRET_KEY='development key'
))

#### Managing connections

# The pattern we're using for managing database connections is to have **a connection per request**. 
# We're using Flask's `@app.before_request` and `@app.teardown_request` for 
# [opening a database connection](http://www.rethinkdb.com/api/python/connect/) and 
# [closing it](http://www.rethinkdb.com/api/python/close/) respectively.
@app.before_request
def before_request():
    try:
        g.rdb_conn = r.connect(host=RDB_HOST, port=RDB_PORT, db=MY_DB)
    except RqlDriverError:
        abort(503, "No database connection could be established.")

@app.teardown_request
def teardown_request(exception):
    try:
        g.rdb_conn.close()
    except AttributeError:
        pass

#### 
@app.errorhandler(404)
def not_found(error=None):
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url
    }
    resp = jsonify(message)
    resp.status_code = 404
    return resp

'''
INDEX ---------------------------------------------------------------
'''
@app.route('/')
def api_root():
    return render_template('explore.html')

# check if a file has extention in ALLOWED_EXTENSIONS
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

# generate random string 
# default: string of length 6 from abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
def id_generator(size=6, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))    
 
# 
@app.route('/explore', methods=['GET', 'POST'])
def explore():
    if not session.get('logged_in'):
        abort(401)
    if not session.get('email'):
        abort(401)
        
    session_email = session.get('email')
    
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            fileName, fileExtension = os.path.splitext(filename)

            inserted = r.table('files').insert({'filename': fileName, 'type': fileExtension, 'user_email': session_email}).run(g.rdb_conn) 
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], inserted['generated_keys'][0] + fileExtension))
            
    return render_template('explore.html', email=session_email)


#### Retrieving a single file
@app.route("/explore/<string:path>", methods=['GET'])
def createAsset(path):
    layerName, layerExtension = os.path.splitext(path)
    
    insertedLayer = r.table('layers').insert({'name': layerName, 'type': layerExtension}).run(g.rdb_conn)
    insertedAsset = r.table('assets').insert({'layers': [{'id': insertedLayer['generated_keys'][0], 'index': 0}]}).run(g.rdb_conn)
    
    src_filename = os.path.join(app.config['UPLOAD_FOLDER'], path)
    dst_filename = os.path.join(app.config['UPLOAD_FOLDER'], insertedLayer['generated_keys'][0] + layerExtension)
    
    shutil.copy(src_filename, dst_filename)
    
    return redirect('/edit/' + insertedAsset['generated_keys'][0])
    
    #asset = r.table('assets').get(insertedAsset['generated_keys'][0]).run(g.rdb_conn)
    #return json.dumps(asset)

#### Retrieving a single layer
@app.route("/layers/<string:layer_id>", methods=['GET'])
def get_layer(layer_id):
    layer = r.table('layers').get(layer_id).run(g.rdb_conn)
    return json.dumps(layer)

#### get asset
@app.route("/edit/<string:asset_id>")
def editAsset(asset_id):
    return render_template('explore.html')

#### Asset in Select Mode
@app.route("/select/<string:asset_id>")
def selectDevice(asset_id):
    return render_template('explore.html')

"""
"""
@app.route('/explore/<string:file_id>', methods=['DELETE'])
def delete_file(file_id):
    if request.method == 'DELETE':
        fileName, fileExtension = os.path.splitext(file_id)
        r.table('files').get(fileName).delete().run(g.rdb_conn)
    
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], file_id))
    return render_template('explore.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = r.table('users').get(email).run(g.rdb_conn)
        
        if json.dumps(user) == 'null':
            flash('wrong email!')
        else:
            if user['password'] == password:
                session['logged_in'] = True
                session['email'] = email
                return redirect(url_for('explore'))
            else:
                flash("wrong password")   
    
    return render_template('explore.html', error=error)

@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        if password != confirm_password:
            flash("Passwords do not match!")
            return render_template('index.html', error=error)
        
        user = r.table('users').get(email).run(g.rdb_conn)
        
        if json.dumps(user) == 'null':
            inserted = r.table('users').insert({'email': email, 'password': password}).run(g.rdb_conn)
            session['logged_in'] = True
            session['email'] = email

            return redirect(url_for('explore'))
        else:
            flash("Email already exists!")
            
    return render_template('explore.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('login'))

#### Listing existing users

# To retrieve all existing users, we are using
# [`r.table`](http://www.rethinkdb.com/api/python/table/)
# command to query the database in response to a GET request from the
# browser. When `table(table_name)` isn't followed by an additional
# command, it returns all documents in the table.
#    
# Running the query returns an iterator that automatically streams
# data from the server in efficient batches.

@app.route("/users", methods=['GET'])
def get_users():
    selection = list(r.table('users').run(g.rdb_conn))
    return json.dumps(selection)

#### Listing existing files
@app.route("/files", methods=['GET'])
def get_files():
    selection = list(r.table('files').run(g.rdb_conn))
    return json.dumps(selection)

#### Listing existing layers
@app.route("/layers", methods=['GET'])
def get_layers():
    selection = list(r.table('layers').run(g.rdb_conn))
    return json.dumps(selection)

#### Listing existing assets
@app.route("/assets", methods=['GET'])
def get_assets():
    selection = list(r.table('assets').run(g.rdb_conn))
    return json.dumps(selection)

#### Creating an user

# We will create a new user in response to a POST request to `/users`
# with a JSON payload using
# [`table.insert`](http://www.rethinkdb.com/api/python/insert/).
#
# The `insert` operation returns a single object specifying the number
# of successfully created objects and their corresponding IDs:
# 
# ```
# {
#   "inserted": 1,
#   "errors": 0,
#   "generated_keys": [
#     "773666ac-841a-44dc-97b7-b6f3931e9b9f"
#   ]
# }
# ```
@app.route("/users", methods=['POST'])
def new_user():
    inserted = r.table('users').insert(request.json).run(g.rdb_conn)
    return jsonify(id=inserted['generated_keys'][0])

#### Creating a file
@app.route("/files", methods=['POST'])
def new_file():
    inserted = r.table('files').insert(request.json).run(g.rdb_conn)
    return jsonify(id=inserted['generated_keys'][0])

#### Retrieving a single user

# Every new user gets assigned a unique ID. The browser can retrieve
# a specific task by GETing `/users/<user_id>`. To query the database
# for a single document by its ID, we use the
# [`get`](http://www.rethinkdb.com/api/python/get/)
# command.
#
# Using a user's ID will prove more useful when we decide to update
# it, mark it completed, or delete it.
@app.route("/users/<string:user_id>", methods=['GET'])
def get_user(user_id):
    user = r.table('users').get(user_id).run(g.rdb_conn)
    return json.dumps(user)

#### Retrieving a single file
@app.route("/files/<string:file_id>", methods=['GET'])
def get_file(file_id):
    file = r.table('files').get(file_id).run(g.rdb_conn)
    return json.dumps(file)

#### Retrieving a single file
@app.route("/assets/<string:asset_id>", methods=['GET'])
def get_asset(asset_id):
    file = r.table('assets').get(asset_id).run(g.rdb_conn)
    return json.dumps(file)

#### Retrieving a single file
@app.route("/uploads/<path:path>")
def get_image(path):
    return app.send_static_file(os.path.join('uploads', path))

@app.route("/edit")
def edit():
    return render_template('explore.html')

@app.route("/select")
def select():
    return render_template('explore.html')


#### Deleting an user

# To delete an user item we'll call a
# [`delete`](http://www.rethinkdb.com/api/python/delete/)
# command on a `DELETE /users/<user_id>` request.
@app.route("/users/<string:user_id>", methods=['DELETE'])
def delete_user(user_id):
    return jsonify(r.table('users').get(user_id).delete().run(g.rdb_conn))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the Flask nrif app')
    parser.add_argument('--setup', dest='run_setup', action='store_true')

    args = parser.parse_args()
    if args.run_setup:
        dbSetup()
    else:
        app.run(debug=True, port=6003, host='0.0.0.0')

# ### Best practices ###
#
# #### Managing connections: a connection per request ####
#
# The RethinkDB server doesn't use a thread-per-connnection approach
# so opening connections per request will not slow down your database.
# 
# #### Fetching multiple rows: batched iterators ####
#
# When fetching multiple rows from a table, RethinkDB returns a
# batched iterator initially containing a subset of the complete
# result. Once the end of the current batch is reached, a new batch is
# automatically retrieved from the server. From a coding point of view
# this is transparent:
#   
#     for result in r.table('todos').run(g.rdb_conn):
#         print result
#     
#    
# #### `replace` vs `update` ####
#
# Both `replace` and `update` operations can be used to modify one or
# multiple rows. Their behavior is different:
#    
# *   `replace` will completely replace the existing rows with new values
# *   `update` will merge existing rows with the new values