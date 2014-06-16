from flask import Flask, url_for, json, jsonify, g, request, Response, render_template, make_response, send_from_directory, abort, session, flash, redirect
from werkzeug.utils import secure_filename

import argparse, os, string, shutil, time, re

import rethinkdb as r
from rethinkdb.errors import RqlRuntimeError, RqlDriverError

from passlib.apps import custom_app_context as pwd_context
from flask.ext.httpauth import HTTPBasicAuth

import sys
sys.path.append("encoder-decoder")
import coder, decoder
from PIL import Image
from config_reader import LayerConfig

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
        r.db(MY_DB).table_create('assets').run(connection)
        r.db(MY_DB).table_create('layers').run(connection)
        r.db(MY_DB).table_create('versions').run(connection)
        print 'Database setup completed. Now run the app without --setup.'
    except RqlRuntimeError:
        print 'App database already exists. Run the app without --setup.'
    finally:
        connection.close()

app = Flask(__name__)
# set maximum allowed payload to 16 megabytes
#app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config.from_object(__name__)
app.config.update(dict(
    SECRET_KEY='the-quick-brown-fox-jumps-over-the-lazy-dog'
))

auth = HTTPBasicAuth()

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
            asset = r.table('assets').insert({'time_stamp': time_stamp,\
                                               'name': layer_name,\
                                               'type': layer_extension,\
                                               'resolutions': "",\
                                               'shared': 'false',\
                                               'user_id': '',\
                                               'size': {}\
                                               }).run(g.rdb_conn)
            asset_id = asset['generated_keys'][0]

            # first layer is the original image
            layer = r.table('layers').insert({'asset_id': asset_id,\
                                               'name': layer_name,\
                                               'type': layer_extension,\
                                               'time_stamp': time_stamp,\
                                               'position': {"x" : 0, "y": 0},\
                                               'size': {}\
                                               }).run(g.rdb_conn)
            layer_id = layer['generated_keys'][0]

            file_path = os.path.join(app.config['UPLOAD_FOLDER'],\
                                    layer_id + layer_extension)

            file.save(os.path.join(app.config['UPLOAD_FOLDER'],\
                                    layer_id + layer_extension))
            # get the size of the image and update the layer
            im = Image.open(file_path)
            (width, height) = im.size
            updated_layer = r.table('layers').get(layer_id).update({\
                                                                "size": {"width": width, "height": height}\
                                                                }).run(g.rdb_conn)
            updated_asset = r.table('assets').get(asset_id).update({\
                                                                "size": {"width": width, "height": height}\
                                                                }).run(g.rdb_conn)

            src = os.path.join(app.config['UPLOAD_FOLDER'], layer_id + layer_extension)
            dst = os.path.join(app.config['UPLOAD_FOLDER'], asset_id + layer_extension)

            shutil.copy(src, dst)
    return render_template('explore.html', email=session_email)

"""
###
"""
@app.route("/layers", methods=['POST'])
def add_layer():
    asset_id = request.form['asset_id']
    smart_layer = request.form['smart_layer']
    if smart_layer and asset_id:
        print asset_id
        time_stamp = time.time()
        layer = r.table('layers').insert({'name': '',\
                                          'type': 'smart',\
                                          'asset_id': asset_id,\
                                          'time_stamp': time_stamp,
                                          'position': {"x" : 0, "y": 0},\
                                          'size': {"width": 100, "height": 100},\
                                          'shape' : "",\
                                          'opacity': 1,\
                                          'gradient': "",\
                                          'blending': ""\
                                          }).run(g.rdb_conn)
        # update the layers of the asset by appending the new layer
        asset = r.table('assets').get(asset_id).update({"time_stamp": time_stamp}).run(g.rdb_conn)
        return jsonify(asset)
    return "error"

"""
### Get asset
"""
@app.route("/edit/<string:asset_id>")
def edit_asset(asset_id):
    return render_template('explore.html')

"""
###
"""
@app.route("/assets/<string:asset_id>", methods=['POST'])
def patch_asset(asset_id):
    asset = r.table('assets').get(asset_id).run(g.rdb_conn)
    asset_type = asset['type']
    if 'composed_image' in request.json:
        # Get only the encoded data
        _, b64data = request.json['composed_image'].split(',')

        # Write data into a file named <asset_id>.png
        composed_image = open(os.path.join(app.config['UPLOAD_FOLDER'], asset_id + asset_type), "wb")
        composed_image.write(b64data.decode('base64'))
        composed_image.close()

        # Insert a timestamp in the asset (meaning something changed)
        time_stamp = time.time()
        asset = r.table('assets').get(asset_id).update({'time_stamp': time_stamp\
                                                        }).run(g.rdb_conn)
        # Return updated asset as request response
        return jsonify(asset)

    if 'image_resolution' in request.json:
        data_url = request.json['image_resolution']
        display_w = str(request.json['display_width'])
        display_h = str(request.json['display_height'])
        version_w = str(request.json['version_w'])
        version_h = str(request.json['version_h'])

        print version_w + "-"+version_h

        #
        file_name = asset_id + "_" + version_w + "x" + version_h
        path_to_file = os.path.join(app.config['UPLOAD_FOLDER'], file_name + asset_type)

        # Get only the encoded data
        _, b64data = data_url.split(',')

        # Insert a timestamp in the asset (meaning something changed)
        timestamp = time.time()
        asset = r.table('assets').get(asset_id).update({'time_stamp': timestamp,\
                                                        'resolutions': file_name
                                                        }).run(g.rdb_conn)
        # If the pair (display_width, display_height) exists, just update it,
        # otherwise insert a new version
        versions = list(r.table('versions').filter({'asset_id': asset_id, 'display_width': display_w, 'display_height': display_h}).run(g.rdb_conn))
        if versions:
            version_id = versions[0]['id']
            version = r.table('versions').get(version_id).update({\
                                                        'time_stamp': timestamp,\
                                                        'name': file_name,\
                                                        'width': version_w,\
                                                        'height': version_h,\
                                                        }).run(g.rdb_conn)
            version_type = versions[0]['type']
        else:
            inserted = r.table('versions').insert({'time_stamp': timestamp,\
                                                'asset_id': asset_id,\
                                               'name': file_name,\
                                               'type': asset_type,\
                                               'display_width': display_w,\
                                               'display_height': display_h,\
                                               'width': version_w,\
                                               'height': version_h,\
                                               'ppi': ""\
                                               }).run(g.rdb_conn)
            version_id = inserted['generated_keys'][0]
            version_type = asset_type

        # Write data into a file named version_id.version_type
        path_to_file = os.path.join(app.config['UPLOAD_FOLDER'], version_id + version_type)
        composed_image = open(path_to_file, "wb")
        composed_image.write(b64data.decode('base64'))
        composed_image.close()

        # Return updated asset as request response
        return jsonify(asset)

"""
#### Asset in Select Mode
"""
@app.route("/select/<string:asset_id>")
def select_device(asset_id):
    return render_template('explore.html')

def encode(filename, config):
    img = Image.open(filename)
    #config = json.load(open(configname, "rb"))
    layers = coder.Coder().encode(img, config)
    i = 0
    #layers2 = []
    asset_id = filename.rsplit('.', 1)[0]
    for layer in layers:
        i += 1
        #file.save(os.path.join(app.config['UPLOAD_FOLDER'],\layer_id + layer_extension))
        layerFileName = asset_id + "_layer" + str(i) + ".webp"
        layer[0].save(layerFileName, "WEBP", quality=95)
        #layer[0].save(layerFileName+".png", "PNG", quality=95)
        # TODO: Run ssim test to see that the image we got is correct
        #layer2 = Image.open(layerFileName)
        #layers2.append(layer2)

"""
#### Asset in Render Mode
"""
@app.route("/render/<string:asset_id>")
def render_asset(asset_id):
    versions = list(r.table('versions').filter({'asset_id': asset_id}).order_by(r.asc('version_w')).run(g.rdb_conn))

    config = []
    for version in versions:
        #print version['version_width']
        print version
        config.append({"imgwidth": int(version['width'])})
    print config
    filename = os.path.join(app.config['UPLOAD_FOLDER'], asset_id + versions[0]['type'])
    encode(filename, config)
    return render_template('explore.html')

"""
### Delete asset
"""
@app.route('/assets/<string:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    file_name, file_extension = os.path.splitext(asset_id)
    # get all layers of asset_id
    layers = list(r.table('layers').filter({'asset_id': file_name}).run(g.rdb_conn))
    # get all versions of asset_id
    versions = list(r.table('versions').filter({'asset_id': file_name}).run(g.rdb_conn))
    # delete asset_id from assets
    deleted_asset = r.table('assets').get(file_name).delete().run(g.rdb_conn)
    # delete all layers of asset_id from layers
    deleted_layers = r.table('layers').filter({'asset_id': file_name}).delete().run(g.rdb_conn)
    # delete asset_id file
    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], asset_id))
    #delete all layer_id files
    for layer in layers:
        if layer['type'] != 'smart':
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], layer['id'] + layer['type']))
    # delete all versions of asset_id from versions
    deleted_versions = r.table('versions').filter({'asset_id': file_name}).delete().run(g.rdb_conn)
    #delete all version_id files
    for version in versions:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], version['id'] + version['type']))
        # TODO remove webp layers
    # return deleted asset
    return json.dumps(deleted_asset)

"""
### Delete layer
"""
@app.route('/layers/<string:layer_id>', methods=['DELETE'])
def delete_layer(layer_id):
    if "asset_id" in request.json:
        asset_id = request.json['asset_id']
        #print layer_id
        # remove file layer_id
        layer = r.table('layers').get(layer_id).run(g.rdb_conn)
        if layer['type'] != 'smart':
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], layer['id'] + layer['type']))
        # remove layer_id from layers
        deleted_layer = r.table('layers').get(layer_id).delete().run(g.rdb_conn)
        # add a new time_stamp to asset_id
        time_stamp = time.time()
        asset = r.table('assets').get(asset_id).update({"time_stamp": time_stamp}).run(g.rdb_conn)
        # return deleted_layer
        return json.dumps(deleted_layer)
    return "error: asset_id not present in json"

"""
### Update layer
"""
@app.route('/layers/<string:layer_id>', methods=['PATCH'])
def update_layer(layer_id):
    # update position and size
    if 'image' in request.form:
        file = request.files['file']

        if file and allowed_file(file.filename):
            layer_name, layer_extension = os.path.splitext(file.filename)

            time_stamp = time.time()

            # first layer is the original image
            layer = r.table('layers').insert({'asset_id': asset_id,\
                                               'name': layer_name,\
                                               'type': layer_extension,\
                                               'time_stamp': time_stamp,\
                                               'position': {"x" : 0, "y": 0},\
                                               'size': {}\
                                               }).run(g.rdb_conn)
            layer_id = layer['generated_keys'][0]

            file_path = os.path.join(app.config['UPLOAD_FOLDER'],\
                                    layer_id + layer_extension)

            file.save(os.path.join(app.config['UPLOAD_FOLDER'],\
                                    layer_id + layer_extension))
            # get the size of the image and update the layer
            im = Image.open(file_path)
            (width, height) = im.size
            updated_layer = r.table('layers').get(layer_id).update({\
                                                                "size": {"width": width, "height": height}\
                                                                }).run(g.rdb_conn)
            updated_asset = r.table('assets').get(asset_id).update({\
                                                                "size": {"width": width, "height": height}\
                                                                }).run(g.rdb_conn)

            src = os.path.join(app.config['UPLOAD_FOLDER'], layer_id + layer_extension)
            dst = os.path.join(app.config['UPLOAD_FOLDER'], asset_id + layer_extension)

            shutil.copy(src, dst)


        position = request.form['position']
        size = request.json['size']

        time_stamp = time.time()
        updated_layer = r.table('layers').get(layer_id).update({"time_stamp": time_stamp,\
                                                                "position": position,\
                                                                "size": size\
                                                                }).run(g.rdb_conn)
        return json.dumps(updated_layer)

    # update position and size
    if 'position' in request.json and 'size' in request.json:
        position = request.json['position']
        size = request.json['size']

        time_stamp = time.time()
        updated_layer = r.table('layers').get(layer_id).update({"time_stamp": time_stamp,\
                                                                "position": position,\
                                                                "size": size\
                                                                }).run(g.rdb_conn)
        return json.dumps(updated_layer)
    # update shape
    if 'shape' in request.json:
        shape = request.json['shape']
        print shape
        print layer_id
        time_stamp = time.time()
        updated_layer = r.table('layers').get(layer_id).update({"time_stamp": time_stamp,\
                                                                "shape": shape\
                                                                }).run(g.rdb_conn)
        return json.dumps(updated_layer)
    # update opacity
    if 'opacity' in request.json:
        opacity = request.json['opacity']

        time_stamp = time.time()
        updated_layer = r.table('layers').get(layer_id).update({"time_stamp": time_stamp,\
                                                                "opacity": opacity\
                                                                }).run(g.rdb_conn)
        return json.dumps(updated_layer)
    # update gradient
    if 'gradient' in request.json:
        gradient = request.json['gradient']

        time_stamp = time.time()
        updated_layer = r.table('layers').get(layer_id).update({"time_stamp": time_stamp,\
                                                                "gradient": gradient\
                                                                }).run(g.rdb_conn)
        return json.dumps(updated_layer)
    # update blending mode
    if 'blending' in request.json:
        blending = request.json['blending']

        time_stamp = time.time()
        updated_layer = r.table('layers').get(layer_id).update({"time_stamp": time_stamp,\
                                                                "blending": blending\
                                                                }).run(g.rdb_conn)
        return json.dumps(updated_layer)

    return "error: asset_id not present in json"

"""
### Delete version
"""
@app.route('/versions/<string:version_id>', methods=['DELETE'])
def delete_version(version_id):
    if "asset_id" in request.json:
        asset_id = request.json['asset_id']
        print version_id
        # remove file version_id
        version = r.table('versions').get(version_id).run(g.rdb_conn)
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], version['id'] + version['type']))
        # remove version_id from version
        deleted_version = r.table('versions').get(version_id).delete().run(g.rdb_conn)
        # add a new time_stamp to asset_id
        time_stamp = time.time()
        asset = r.table('assets').get(asset_id).update({"time_stamp": time_stamp}).run(g.rdb_conn)
        # return deleted_layer
        return json.dumps(deleted_version)
    return "error: asset_id not present in json"

"""
### Return hashed password from plain password
"""
def hash_password(password):
    return pwd_context.encrypt(password)

"""
### Check if plain passwords matched the hashed password
"""
def verify_password(password, password_hash):
    return pwd_context.verify(password, password_hash)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = r.table('users').get(email).run(g.rdb_conn)

        if json.dumps(user) == 'null':
            flash('wrong email!')
        else:
            if verify_password(password, user['password']):
                session['logged_in'] = True
                session['email'] = email
                return redirect(url_for('explore'))
            else:
                flash("wrong password")
    return render_template('explore.html')

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
            hashed_password = hash_password(password)
            inserted = r.table('users').insert({'email': email, 'password': hashed_password}).run(g.rdb_conn)
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


@app.route('/signin', methods=['POST'])
def sign_in():
    if 'email' in request.json and 'password' in request.json:
        email = request.json['email']
        password = request.json['password']

        user = r.table('users').get(email).run(g.rdb_conn)
        if json.dumps(user) == 'null':
            return "Wrong email!"
        else:
            if user['password'] == password:
                session['logged_in'] = True
                session['email'] = email
                return "Success"
            else:
                return "Wrong password!"
    else:
        return "No email or password!"

@app.route('/signout', methods=['GET'])
def sign_out():
    session.pop('logged_in', None)
    return "Success"

"""
### Retrieving a single layer
"""
@app.route("/layers/<string:layer_id>", methods=['GET'])
def get_layer(layer_id):
    layer = r.table('layers').get(layer_id).run(g.rdb_conn)
    return json.dumps(layer)

"""
### Listing existing layers
"""
@app.route("/layers", methods=['GET'])
def get_all_layers():
    layers = list(r.table('layers').run(g.rdb_conn))
    return json.dumps(layers)

"""
### Listing existing versions
"""
@app.route("/versions", methods=['GET'])
def get_all_versions():
    versions = list(r.table('versions').run(g.rdb_conn))
    return json.dumps(versions)

"""
### Listing existing assets
"""
@app.route("/assets", methods=['GET'])
def get_assets():
    selection = list(r.table('assets').order_by(r.desc('time_stamp')).run(g.rdb_conn))
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
def get_all_layers_for_asset(asset_id):
    layers = list(r.table('layers').filter({'asset_id': asset_id}).order_by(r.asc('time_stamp')).run(g.rdb_conn))
    return json.dumps(layers)

"""
### Retrieving all versions of asset_id ordered first by width, second by height
"""
@app.route("/versionsOfAsset/<string:asset_id>", methods=['GET'])
def get_all_versions_for_asset(asset_id):
    versions = list(r.table('versions').filter({'asset_id': asset_id}).order_by(r.asc('width')).order_by(r.asc('height')).run(g.rdb_conn))
    return json.dumps(versions)

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

"""
###
"""
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run New-Responsive-Image-Format app')
    parser.add_argument('--setup', dest='run_setup', action='store_true')

    args = parser.parse_args()
    if args.run_setup:
        dbSetup()
    else:
        app.run(debug=True, port=6003, host='0.0.0.0')
