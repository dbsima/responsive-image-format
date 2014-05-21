from flask import Flask, url_for, json, jsonify, g, request, Response, render_template, make_response, send_from_directory, abort, session, flash, redirect
from util import make_json_response, make_error_response, bad_id_response
from werkzeug.utils import secure_filename

import argparse
import json
import os

import string
import random

import shutil

import time


import rethinkdb as r
from rethinkdb.errors import RqlRuntimeError, RqlDriverError

"""
### Connection details
"""
RDB_HOST =  os.environ.get('RDB_HOST') or 'localhost'
RDB_PORT = os.environ.get('RDB_PORT') or 28015
MY_DB = 'mydb'

# Where will the uploaded files be stored
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(APP_ROOT, 'static/files')
# Set of allowed file extensions
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'svg'])

"""
### Setting up the app database
"""
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
    SECRET_KEY='development_key'
))

"""
### Managing connections (open and close it)
"""
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

"""
### 
"""
@app.errorhandler(404)
def not_found(error=None):
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url
    }
    resp = jsonify(message)
    resp.status_code = 404
    return resp

"""
### 
"""
@app.errorhandler(401)
def not_authorized(error=None):
    message = {
        'status': 401,
        'message': 'You must first login/signup'
    }
    resp = jsonify(message)
    resp.status_code = 401
    return resp

"""
### Check if a file has extention in ALLOWED_EXTENSIONS
"""
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

"""
### Home
"""
@app.route('/')
def api_root():
    return render_template('explore.html')

"""
### Edit Tab without asset
"""
@app.route("/edit")
def edit():
    return render_template('explore.html')

"""
### Select Tab without asset
"""
@app.route("/select")
def select():
    return render_template('explore.html')

"""
### Render Tab without asset
"""
@app.route("/render")
def render():
    return render_template('explore.html')  

"""
###
"""
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
            layer_name, layer_extension = os.path.splitext(file.filename)
            
            time_stamp = time.time()
            inserted_asset = r.table('assets').insert({'time_stamp': time_stamp, 'type': layer_extension, 'resolutions': "", 'shared': 'false', 'user_id': ''}).run(g.rdb_conn)
            inserted_layer = r.table('layers').insert({'asset_id': inserted_asset['generated_keys'][0], 'name': layer_name, 'type': layer_extension, 'time_stamp': time_stamp}).run(g.rdb_conn)
            
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], inserted_layer['generated_keys'][0] + layer_extension))
            
            src_filename = os.path.join(app.config['UPLOAD_FOLDER'], inserted_layer['generated_keys'][0] + layer_extension)
            dst_filename = os.path.join(app.config['UPLOAD_FOLDER'], inserted_asset['generated_keys'][0] + layer_extension)

            shutil.copy(src_filename, dst_filename)
    return render_template('explore.html', email=session_email)


"""
###
"""
@app.route("/layers", methods=['POST'])
def addLayer():
    file = request.files['file']
    asset_id = request.form['asset_id']
    
    if file and asset_id and allowed_file(file.filename):
        time_stamp = time.time()
        layer_name, layer_extension = os.path.splitext(file.filename)
        inserted_layer = r.table('layers').insert({'name': layer_name, 'type': layer_extension, 'asset_id': asset_id, 'time_stamp': time_stamp}).run(g.rdb_conn)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], inserted_layer['generated_keys'][0] + layer_extension))    
        
        # update the layers of the asset by appending the new layer
        asset = r.table('assets').get(asset_id).update({"time_stamp": time_stamp}).run(g.rdb_conn)
        # Return updated asset as request response
        return jsonify(asset)
    return "error"

"""
### Get asset
"""
@app.route("/edit/<string:asset_id>")
def editAsset(asset_id):
    return render_template('explore.html')

"""
### 
"""
@app.route("/assets/<string:asset_id>", methods=['POST'])
def patch_asset(asset_id):
    
    if 'composed_image' in request.json:
        # Get only the encoded data
        _, b64data = request.json['composed_image'].split(',')

        # Write data into a file named <asset_id>.png
        composed_image = open(os.path.join(app.config['UPLOAD_FOLDER'], asset_id + ".png"), "wb")
        composed_image.write(b64data.decode('base64'))
        composed_image.close()

        # Insert a timestamp in the asset (meaning something changed)
        time_stamp = time.time()
        asset = r.table('assets').get(asset_id).update({'time_stamp': time_stamp}).run(g.rdb_conn)
        
        # Return updated asset as request response
        return jsonify(asset)
    
    if 'image_resolution' in request.json:
        data_url = request.json['image_resolution']
        display_w = str(request.json['display_width'])
        display_h = str(request.json['display_height'])
        
        file_name = asset_id + "_" + display_w + "x" + display_h
        path_to_file = os.path.join(app.config['UPLOAD_FOLDER'], file_name + ".png")

        # Get only the encoded data
        _, b64data = data_url.split(',')

        # Write data into a file named <asset_id>_<display_w>x<display_h>.png
        composed_image = open(path_to_file, "wb")
        composed_image.write(b64data.decode('base64'))
        composed_image.close()

        # Insert a timestamp in the asset (meaning something changed)
        timestamp = time.time()
        asset = r.table('assets').get(asset_id).update({'time_stamp': timestamp, 'resolutions': file_name}).run(g.rdb_conn)
        
        # Return updated asset as request response
        return jsonify(asset)
    
"""
#### Asset in Select Mode
"""
@app.route("/select/<string:asset_id>")
def select_device(asset_id):
    return render_template('explore.html')

"""
#### Asset in Render Mode
"""
@app.route("/render/<string:asset_id>")
def render_asset(asset_id):
    return render_template('explore.html')

"""
### Delete asset
"""
@app.route('/assets/<string:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    file_name, file_extension = os.path.splitext(asset_id)
    # get all layers of asset_id
    layers = list(r.table('layers').filter({'asset_id': file_name}).run(g.rdb_conn))
    # delete asset_id from assets
    deleted_asset = r.table('assets').get(file_name).delete().run(g.rdb_conn)
    # delete all layers of asset_id from layers
    deleted_layers = r.table('layers').filter({'asset_id': file_name}).delete().run(g.rdb_conn)
    # delete asset_id file
    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], asset_id))
    #delete all layer_id files
    for layer in layers:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], layer['id'] + layer['type']))
    # return deleted asset
    return json.dumps(deleted_asset)

"""
### Delete layer
"""
@app.route('/layers/<string:layer_id>', methods=['DELETE'])
def delete_layer(layer_id):
    if "asset_id" in request.json:
        asset_id = request.json['asset_id']
        print layer_id
        # remove file layer_id
        layer = r.table('layers').get(layer_id).run(g.rdb_conn)
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], layer['id'] + layer['type']))
        # remove layer_id from layers
        deleted_layer = r.table('layers').get(layer_id).delete().run(g.rdb_conn)
        # add a new time_stamp to asset_id
        time_stamp = time.time()
        asset = r.table('assets').get(asset_id).update({"time_stamp": time_stamp}).run(g.rdb_conn)
        # return deleted_layer
        return json.dumps(deleted_layer)
    
    return "error"

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

"""
### Retrieve a single layer
"""
@app.route("/layers/<string:asset_id>", methods=['GET'])
def get_layer(asset_id):
    layers = list(r.table('layers').filter({'asset_id': asset_id}).order_by(r.asc('time_stamp')).run(g.rdb_conn))
    return json.dumps(layers)

"""
### Listing existing layers
"""
@app.route("/layers", methods=['GET'])
def get_all_layers():
    layers = list(r.table('layers').run(g.rdb_conn))
    return json.dumps(layers)

"""
### Listing existing assets
"""
@app.route("/assets", methods=['GET'])
def get_assets():
    selection = list(r.table('assets').run(g.rdb_conn))
    return json.dumps(selection)

"""
### Retrieving a single asset
"""
@app.route("/assets/<string:asset_id>", methods=['GET'])
def get_asset(asset_id):
    asset = r.table('assets').get(asset_id).run(g.rdb_conn)
    return json.dumps(asset)

"""
### Retrieving all layers of asset_id
"""
@app.route("/layersOfAsset/<string:asset_id>", methods=['GET'])
def get_all_layer_for_asset(asset_id):
    layers = list(r.table('layers').filter({'asset_id': asset_id}).order_by(r.asc('time_stamp')).run(g.rdb_conn))
    return json.dumps(layers)

"""
### Retrieving a single file
"""
@app.route("/files/<path:path>")
def get_image(path):
    return app.send_static_file(os.path.join('files', path))

"""
### Creating a new user
"""
@app.route("/users", methods=['POST'])
def new_user():
    inserted = r.table('users').insert(request.json).run(g.rdb_conn)
    return jsonify(id=inserted['generated_keys'][0])

"""
#### Deleting an user
"""
@app.route("/users/<string:user_id>", methods=['DELETE'])
def delete_user(user_id):
    return jsonify(r.table('users').get(user_id).delete().run(g.rdb_conn))

"""
### Retrieving a single user
"""
@app.route("/users/<string:user_id>", methods=['GET'])
def get_user(user_id):
    user = r.table('users').get(user_id).run(g.rdb_conn)
    return json.dumps(user)

"""
### Listing existing users
"""
@app.route("/users", methods=['GET'])
def get_users():
    selection = list(r.table('users').run(g.rdb_conn))
    return json.dumps(selection)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run New-Responsive-Image-Format app')
    parser.add_argument('--setup', dest='run_setup', action='store_true')

    args = parser.parse_args()
    if args.run_setup:
        dbSetup()
    else:
        app.run(debug=True, port=6003, host='0.0.0.0')
