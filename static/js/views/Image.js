/*global define, console*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.image,

        initialize: function () {
            //console.log("initialize");
            this.listenTo(App.vent, "initStage", this.onInitStage);
            this.listenTo(App.vent, "updateStage", this.onUpdateStage);

            this.listenTo(App.vent, "afterLayerChanged", this.onLayerChange);

            var i, asset = this.model.toJSON();
            this.assetID = asset.id;

            this.stage = "";
            this.sources = {};

            var self = this;
            $.ajax({
                async: false,
                type: "GET",
                url: "/layersOfAsset/" + asset.id,
                dataType: 'json',
                success: function (layers) {
                    console.log("success GET on /layers with asset_id in json");
                    //console.log(layers);
                    var i;
                    for (i = 0; i < layers.length; i = i + 1) {
                        //console.log("layer id " + layers[i].id + layers[i].ext);
                        this.sources[i] = {
                            id: String(layers[i].id),
                            path: "../files/" + layers[i].id + layers[i].ext,
                            ext: layers[i].ext,
                            type: layers[i].type,
                            x: layers[i].position.x,
                            y: layers[i].position.y,
                            width: layers[i].size.width,
                            height: layers[i].size.height
                        };

                        this.sources[i]['shape'] = layers[i].shape;
                        this.sources[i]['opacity'] = layers[i].opacity;
                        this.sources[i]['gradient'] = layers[i].gradient;
                        this.sources[i]['blending'] = layers[i].blending;

                    }
                }.bind(this),
                error: function (response) {
                    console.log("error GET on /layers with asset_id in json");
                }
            });
        },

        events : {
            'click #btnApply' : 'applyOperation',
            'click #btnSelect' : 'selectDisplay',
            'click #openSmartShape': 'initSmartShape'
        },

        onLayerChange : function(options) {
            console.log(options);
            //this.initialize();
            //this.render();
        },

        initSmartShape : function () {
            var form_data = new FormData();
            form_data.append("asset_id", this.assetID);
            form_data.append("smart_layer", 'cacamaca');
            var self = this;
            $.ajax({
                async: false,
                url: "/layers",
                dataType: 'text',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,
                type: 'post',
                success: function (response) {
                    // rerender stage after new smart shape added
                    self.initialize();
                    self.render();
                },
                error: function (response) {
                    console.log("error POST on /layers");
                    //console.log(response);
                }
            });
        },

        onUpdateStage: function (options) {
            this.stage = options.stage;
        },

        postStage: function (assetID, dataUrl) {
            $.ajax({
                async: false,
                type: "POST",
                url: "/assets/" + assetID,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"composed_image": dataUrl}, null, '\t'),
                success: function (response) {
                    //console.log("success POST on /assets/:assetID");
                    //console.log(response);

                },
                error: function (response) {
                    //console.log("error POST on /assets/:assetID");
                    //console.log(response);
                }
            });
        },

        onInitStage: function (options) {
            this.stage = options.stage;
            var self = this;

            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var asset_id = document.getElementById('btnApply').getAttribute('data-id');
                    self.postStage(asset_id, dataUrl);
                }
            });
        },

        applyOperation: function () {
            var self = this;
            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var assetId = document.getElementById('btnApply').getAttribute('data-id');
                    self.postStage(assetId, dataUrl);
                }
            });
        },

        selectDisplay: function () {
            //console.log("select");
        },

        onRender : function () {
            //console.log(this.sources);
            // function for updating the stage when an anchor is dragged
            function update(activeAnchor) {
                var activeGrip = activeAnchor,
                    activeGripName = activeGrip.name(),
                    group = activeAnchor.getParent(),

                    gripTL = group.find('.gripTL')[0],
                    gripTC = group.find('.gripTC')[0],
                    gripTR = group.find('.gripTR')[0],
                    gripMR = group.find('.gripMR')[0],
                    gripBR = group.find('.gripBR')[0],
                    gripBC = group.find('.gripBC')[0],
                    gripBL = group.find('.gripBL')[0],
                    gripML = group.find('.gripML')[0],
                    gripR = group.find('.gripR')[0],
                    shape = group.find('.image')[0],

                    anchorX = activeAnchor.x(),
                    anchorY = activeAnchor.y(),

                    newWidth, newHeight,
                    minWidth, minHeight,
                    oldX, oldY,
                    imageX, imageY;

                // update anchor positions
                switch (activeAnchor.name()) {
                case 'gripTL':
                    oldY = gripTR.y();
                    oldX = gripBL.x();
                    gripTR.y(anchorY);
                    gripTC.y(anchorY);
                    gripTC.x((gripTL.x() + gripTR.x()) / 2);
                    gripBL.x(anchorX);
                    gripML.x(anchorX);
                    gripML.y((gripTL.y() + gripBL.y()) / 2);
                    gripMR.y((gripTR.y() + gripBR.y()) / 2);
                    gripBC.x((gripBL.x() + gripBR.x()) / 2);
                    gripR.x((gripBL.x() + gripBR.x()) / 2);
                    break;

                case 'gripTC':
                    oldY = gripTL.y();
                    oldX = gripBC.x();
                    gripTR.y(anchorY);
                    gripTL.y(anchorY);
                    gripML.y((gripTL.y() + gripBL.y()) / 2);
                    gripMR.y((gripTR.y() + gripBR.y()) / 2);
                    break;

                case 'gripTR':
                    oldY = gripTL.y();
                    oldX = gripBR.x();
                    gripTL.y(anchorY);
                    gripTC.y(anchorY);
                    gripTC.x((gripTL.x() + gripTR.x()) / 2);
                    gripBR.x(anchorX);
                    gripMR.x(anchorX);
                    gripMR.y((gripTL.y() + gripBR.y()) / 2);
                    gripBC.x((gripBL.x() + gripBR.x()) / 2);
                    gripR.x((gripBL.x() + gripBR.x()) / 2);
                    gripML.y((gripTL.y() + gripBL.y()) / 2);
                    break;

                case 'gripMR':
                    oldY = gripML.y();
                    oldX = gripTR.x();
                    gripTR.x(anchorX);
                    gripBR.x(anchorX);
                    gripTC.x((gripTL.x() + gripTR.x()) / 2);
                    gripBC.x((gripBL.x() + gripBR.x()) / 2);
                    gripR.x((gripBL.x() + gripBR.x()) / 2);
                    break;

                case 'gripBR':
                    oldY = gripBL.y();
                    oldX = gripTR.x();
                    gripTC.x((gripTL.x() + gripTR.x()) / 2);
                    gripBL.y(anchorY);
                    gripML.y((gripTL.y() + gripBL.y()) / 2);
                    gripBC.y(anchorY);
                    gripBC.x((gripBL.x() + gripBR.x()) / 2);
                    gripR.y(anchorY + 50);
                    gripR.x((gripBL.x() + gripBR.x()) / 2);
                    gripTR.x(anchorX);
                    gripMR.x(anchorX);
                    gripMR.y((gripTR.y() + gripBR.y()) / 2);
                    break;

                case 'gripBC':
                    oldY = gripBR.y();
                    oldX = gripTC.x();
                    gripBR.y(anchorY);
                    gripBL.y(anchorY);
                    gripML.y((gripTL.y() + gripBL.y()) / 2);
                    gripMR.y((gripTR.y() + gripBR.y()) / 2);
                    break;

                case 'gripBL':
                    oldY = gripBR.y();
                    oldX = gripTL.x();
                    gripBR.y(anchorY);
                    gripTL.x(anchorX);
                    gripML.x(anchorX);
                    gripML.y((gripTL.y() + gripBL.y()) / 2);
                    gripBC.y(anchorY);
                    gripBC.x((gripBL.x() + gripBR.x()) / 2);
                    gripR.y(anchorY + 50);
                    gripR.x((gripBL.x() + gripBR.x()) / 2);
                    gripMR.y((gripTR.y() + gripBR.y()) / 2);
                    gripTC.x((gripTL.x() + gripTR.x()) / 2);
                    break;

                case 'gripML':
                    oldY = gripMR.y();
                    oldX = gripTL.x();
                    gripTL.x(anchorX);
                    gripBL.x(anchorX);
                    gripTC.x((gripTL.x() + gripTR.x()) / 2);
                    gripBC.x((gripBL.x() + gripBR.x()) / 2);
                    gripR.x((gripBL.x() + gripBR.x()) / 2);
                    break;
                }

                newHeight = gripBL.y() - gripTL.y();
                newWidth = shape.width() * newHeight / shape.height();
                /*
                // If the new resolution is lower than 1x1 or greater than the
                // original resolution of the image, move the cursor back
                if (newWidth < minWidth || newHeight < minHeight) {
                    activeGrip.y(oldY);
                    activeGrip.x(oldX);
                    switch (activeAnchor.name()) {
                    case 'gripTL':
                        gripTR.y(oldY);
                        gripTC.y(oldY);
                        gripTC.x((oldX + gripTR.x()) / 2);
                        gripBL.x(oldX);
                        gripML.x(oldX);
                        gripML.y((oldY + gripBL.y()) / 2);
                        gripMR.y((gripTR.y() + gripBR.y()) / 2);
                        gripBC.x((gripBL.x() + gripBR.x()) / 2);
                        gripR.x((gripBL.x() + gripBR.x()) / 2);
                        break;
                    case 'gripTC':
                        gripTR.y(oldY);
                        gripTL.y(oldY);
                        gripML.y((gripTL.y() + gripBL.y()) / 2);
                        gripMR.y((gripTR.y() + gripBR.y()) / 2);
                        break;
                    case 'gripTR':
                        gripTL.y(oldY);
                        gripTC.y(oldY);
                        gripTC.x((gripTL.x() + gripTR.x()) / 2);
                        gripBR.x(oldX);
                        gripMR.x(oldX);
                        gripMR.y((gripTL.y() + gripBR.y()) / 2);
                        gripBC.x((gripBL.x() + gripBR.x()) / 2);
                        gripR.x((gripBL.x() + gripBR.x()) / 2);
                        gripML.y((gripTL.y() + gripBL.y()) / 2);
                        break;
                    case 'gripMR':
                        gripTR.x(oldX);
                        gripBR.x(oldX);
                        gripTC.x((gripTL.x() + gripTR.x()) / 2);
                        gripBC.x((gripBL.x() + gripBR.x()) / 2);
                        gripR.x((gripBL.x() + gripBR.x()) / 2);
                        break;
                    case 'gripBR':
                        gripTC.x((gripTL.x() + gripTR.x()) / 2);
                        gripBL.y(oldY);
                        gripML.y((gripTL.y() + gripBL.y()) / 2);
                        gripBC.y(oldY);
                        gripBC.x((gripBL.x() + gripBR.x()) / 2);
                        gripR.y(oldY + 50);
                        gripR.x((gripBL.x() + gripBR.x()) / 2);
                        gripTR.x(oldX);
                        gripMR.x(oldX);
                        gripMR.y((gripTR.y() + gripBR.y()) / 2);
                        break;
                    case 'gripBC':
                        gripBR.y(oldY);
                        gripBL.y(oldY);
                        gripML.y((gripTL.y() + gripBL.y()) / 2);
                        gripMR.y((gripTR.y() + gripBR.y()) / 2);
                        break;
                    case 'gripBL':
                        gripBR.y(oldY);
                        gripTL.x(oldX);
                        gripML.x(oldX);
                        gripML.y((gripTL.y() + gripBL.y()) / 2);
                        gripBC.y(oldY);
                        gripBC.x((gripBL.x() + gripBR.x()) / 2);
                        gripR.y(oldY + 50);
                        gripR.x((gripBL.x() + gripBR.x()) / 2);
                        gripMR.y((gripTR.y() + gripBR.y()) / 2);
                        gripTC.x((gripTL.x() + gripTR.x()) / 2);
                        break;
                    case 'gripML':
                        gripTL.x(oldX);
                        gripBL.x(oldX);
                        gripTC.x((gripTL.x() + gripTR.x()) / 2);
                        gripBC.x((gripBL.x() + gripBR.x()) / 2);
                        gripR.x((gripBL.x() + gripBR.x()) / 2);
                        break;
                    }
                }

                newHeight = gripBL.y() - gripTL.y();
                newWidth = shape.width() * newHeight / shape.height();

                // Move the image to adjust for the new dimensions.
                // The position calculation changes depending on where it is anchored.
                // ie. When dragging on the right, it is anchored to the top left,
                //     when dragging on the left, it is anchored to the top right.
                if (activeGripName === "gripTR" || activeGripName === "gripBR") {
                    shape.position({x: gripTL.x(), y: gripTL.y()});
                } else if (activeGripName === "gripTL" || activeGripName === "gripBL") {
                    shape.position({x: gripTR.x() - newWidth, y: gripTR.y()});
                }

                imageX = shape.x();
                imageY = shape.y();
                //console.log(image.getPosition());

                // Update grip positions to reflect new image dimensions
                gripTL.position({x: imageX, y: imageY});
                gripTR.position({x: imageX + newWidth, y: imageY});
                gripBR.position({x: imageX + newWidth, y: imageY + newHeight});
                gripBL.position({x: imageX, y: imageY + newHeight});

                // Set the image's size to the newly calculated dimensions
                if (newWidth && newHeight) {
                    shape.size({width: newWidth, height: newHeight});

                    App.vent.trigger("showCurrentImageSize", {
                        "currentImageWidth": newWidth,
                        "currentImageHeight" : newHeight,
                        "current_layer": shape.attrs.id,
                        "current_asset" : document.getElementById('btnApply').getAttribute('data-id')
                    });
                }
                */
                // update the position of the image
                //console.log(gripTL.x() + "+" +  gripTL.y());
                shape.position({x: gripTL.x(), y: gripTL.y()});

                // compute the new width and height of the image
                var width = gripTR.x() - gripTL.x(),
                    height = gripBL.y() - gripTL.y();

                // update the weight and height of the image
                if (width && height) {
                    shape.size({width: width, height: height});
                    //console.log(shape);
                    App.vent.trigger("showCurrentLayerSize", {
                        "current_width": width,
                        "current_height": height,
                        "current_layer": shape.attrs.id,
                        "current_asset" : document.getElementById('btnApply').getAttribute('data-id')
                    });
                }
            }
            // Add anchor in a group at a position
            function addAnchor(group, x, y, name) {
                var stage = group.getStage(),
                    layer = group.getLayer(),
                    anchor = new Kinetic.Circle({
                        x: x,
                        y: y,
                        radius: 10,
                        stroke: '#666',
                        strokeWidth: 2,
                        fill: '#ddd',
                        //opacity: 0.7,
                        name: name,
                        draggable: true,
                        dragOnTop: false
                    });

                anchor.on('dragmove', function () {
                    update(this);
                    layer.draw();
                });

                anchor.on('mousedown touchstart', function () {
                    group.setDraggable(false);
                    this.moveToTop();
                });

                anchor.on('dragend', function () {
                    group.setDraggable(true);
                    layer.draw();
                });

                // add hover styling
                anchor.on('mouseover', function () {
                    if (anchor.name() === 'gripTC' || anchor.name() === 'gripBC') {
                        document.body.style.cursor = 'ns-resize';
                    } else if (anchor.name() === 'gripML' || anchor.name() === 'gripMR') {
                        document.body.style.cursor = 'ew-resize';
                    } else if (anchor.name() === 'gripTL' || anchor.name() === 'gripBR') {
                        document.body.style.cursor = 'nwse-resize';
                    } else if (anchor.name() === 'gripTR' || anchor.name() === 'gripBL') {
                        document.body.style.cursor = 'nesw-resize';
                    }
                    this.setStrokeWidth(4);
                    layer.draw();
                });

                anchor.on('mouseout', function () {
                    var layer = this.getLayer();
                    document.body.style.cursor = 'default';
                    this.strokeWidth(2);
                    layer.draw();
                });

                // set anchors gripTC and gripBC to move only on vertical
                if (anchor.name() === 'gripTC' || anchor.name() === 'gripBC') {
                    anchor.dragBoundFunc(function (pos) {
                        return {
                            x: this.getAbsolutePosition().x,
                            y: pos.y
                        }
                    });
                }
                // set anchors gripML and gripMR to move only on horizontal
                if (anchor.name() === 'gripML' || anchor.name() === 'gripMR') {
                    anchor.dragBoundFunc(function (pos) {
                        return {
                            x: pos.x,
                            y: this.getAbsolutePosition().y
                        }
                    });
                }
                group.add(anchor);
                //anchor.hide();
            }
            //
            function loadImages(sources, callback) {
                //console.log("here3")
                //console.log(sources);
                var images = {},
                    loadedImages = 0,
                    numImages = 0;

                // count the number of images to load
                _.each(sources, function (val, key) {
                    if (val) {
                        numImages = numImages + 1;
                    }
                });

                _.each(sources, function (val, id) {
                    if (val) {
                        loadedImages++;
                        images[id] = new Image();
                        if (val.type !== "smart" || (val.type === "smart" && val.ext !== "smart")) {
                            images[id].onload = function () {
                                // initStage only after all images are loaded
                                if (loadedImages >= numImages) {
                                    //console.log(images);
                                    callback(images);
                                }
                            };
                            //console.log(val.path);
                            images[id].src = val.path + "?"+(new Date()).getTime();
                        }
                        images[id].opacity = val.opacity;
                        images[id].gradient = val.gradient;
                        images[id].shape = val.shape;
                        images[id].blending = val.blending;

                        images[id].ext = val.ext;
                        images[id].type = val.type;
                        images[id].name = val.id;
                        images[id].id = val.id;
                        images[id].X = val.x;
                        images[id].Y = val.y;

                        //console.log(images[id].X);
                        images[id].height = val.height;
                        images[id].width = val.width;
                    }
                });
            }
            //
            function initStage(images) {
                var stage_width = document.getElementById('btnApply').getAttribute('data-width'),
                    stage_height = document.getElementById('btnApply').getAttribute('data-height');
                if (stage_width >= $('#container').width() && stage_height >= $('#container').height()) {
                    stage_width = $('#container').width();
                    stage_height = $('#container').height();
                }

                var stage = new Kinetic.Stage({
                    container: 'container',
                    width: stage_width,
                    height: stage_height
                });
                //console.log(stage.getX() + "-" + stage.getY());

                // send initial width and size
                App.vent.trigger("showInitialLayerSize", {
                    "initial_width": stage.getWidth(),
                    "initial_height" : stage.getHeight()
                });

                var layer = new Kinetic.Layer(),
                    bg = new Kinetic.Rect({
                        width: stage.getWidth(),
                        height: stage.getHeight(),
                        fill : '',
                        x: 0,
                        y: 0
                    });
                layer.add(bg);

                layer.on('mousedown', function (e) {
                    var node = e.target;
                    //console.log(node);
                    select(node);
                });
                // For each layer create a group and add anchors
                _.each(images, function (val, key) {
                    if (val) {
                        var group = new Kinetic.Group({
                            x: val.X,
                            y: val.Y,
                            draggable: true
                        });
                        // update W & H in Operations -> Resize
                        group.on('click', function () {
                            var shape = group.find('.image')[0];

                            //console.log('here10');
                            //console.log(val);

                            App.vent.trigger("showCurrentLayerSize", {
                                "current_width": shape.getWidth(),
                                "current_height": shape.getHeight(),
                                "current_layer": shape.getId(),
                                "current_asset": document.getElementById('btnApply').getAttribute('data-id'),
                                "opacity": val.opacity,
                                "gradient": val.gradient,
                                "blending": val.blending,
                                "shape": val.shape,
                                "ext": val.ext,
                                "type": val.type
                            });
                        });

                        layer.add(group);

                        var shape;
                        //console.log("[" + val.X + ", " + val.Y + " ] - [" + val.width + ", " + val.height + "]");

                        if (val.type === 'smart') {
                            //console.log('smart');
                            //console.log(images[key]);
                            shape = new Kinetic.Rect({
                                x: 0,
                                y: 0,
                                width: val.width,
                                height: val.height,
                                fill : '',
                                name: 'image',
                                id: images[key].name,
                                //fillPatternImage: images[key-1],
                                //fillPatternOffset: {x:-220, y:70},
                                //fillPatternScale: {x:0.5, y:0.5},
                                //fillPatternRepeat: 'no-repeat'
                            });
                            shape.stroke('grey');
                            shape.strokeWidth(1);
                            // add gradient if set
                            if (val.gradient === 'linear') {
                                //console.log('linear');
                                shape.fillLinearGradientStartPoint({x: 0, y: 0});
                                shape.fillLinearGradientEndPoint({x: val.width, y: val.height});
                                shape.fillLinearGradientColorStops([0, 'white', 1, 'grey']);
                            } else if (val.gradient === 'radial') {
                                // radial
                                //console.log('radial');
                                shape.fillLinearGradientStartPoint({x: 0, y: 0});
                                shape.fillLinearGradientEndPoint({x: val.width, y: val.height});
                                shape.fillLinearGradientColorStops([0, 'white', 1, 'grey']);
                            } else {
                                shape.fill('');
                            }
                            // add opacity if set
                            if (val.opacity) {
                                //console.log('opacity');
                                shape.opacity(val.opacity);
                            }
                            if (val.ext !== 'smart') {
                                //console.log('image to smart');
                                shape.fillPatternImage(images[key]);
                                shape.fillPatternOffset({x:-220, y:70});
                                shape.fillPatternScale({x:0.5, y:0.5});
                                shape.fillPatternRepeat('no-repeat');
                            }
                        } else {
                            shape = new Kinetic.Image({
                                x: 0,
                                y: 0,
                                width: val.width,
                                height: val.height,
                                fill : '',
                                name: 'image',
                                id: images[key].name,
                                //fillPatternImage: images[key-1],
                                //fillPatternOffset: {x:-220, y:70},
                                //fillPatternScale: {x:0.5, y:0.5},
                                //fillPatternRepeat: 'no-repeat'
                            });
                            shape.image(images[key]);
                        }
                        //console.log(val.X + ' - ' + val.Y + " : " + shape.getWidth() + " - " +  shape.getHeight())
                        group.add(shape);
                        addAnchor(group, 0, 0, 'gripTL');
                        addAnchor(group, shape.getWidth() / 2, 0, 'gripTC');
                        addAnchor(group, shape.getWidth(), 0, 'gripTR');
                        addAnchor(group, shape.getWidth(), shape.getHeight() / 2, 'gripMR');
                        addAnchor(group, shape.getWidth(), shape.getHeight(), 'gripBR');
                        addAnchor(group, shape.getWidth() / 2, shape.getHeight(), 'gripBC');
                        addAnchor(group, 0, shape.getHeight(), 'gripBL');
                        addAnchor(group, 0, shape.getHeight() / 2, 'gripML');
                        // Rotate grip
                        addAnchor(group, shape.getWidth() / 2, shape.getHeight() + 50, 'gripR');

                        group.on('dragstart', function () {
                            this.moveToTop();
                        });

                        group.on('dragend', function () {
                            App.vent.trigger("updateStage", {stage: stage});

                            //console.log("[" + this.getAbsolutePosition().x + ", " + this.getAbsolutePosition().y + " ] - [" + group.find('.image')[0].getSize().width + ", " + group.find('.image')[0].getSize().height + "]");

                            var self = this;
                            $.ajax({
                                url: "/layers/" + self.find('.image')[0].getId(),
                                contentType: 'application/json;charset=UTF-8',
                                data: JSON.stringify({"position": self.getAbsolutePosition(), "size": self.find('.image')[0].getSize()}),
                                type: 'PATCH',
                                success: function (response) {
                                    console.log("success PATCH on /layers");
                                },
                                error: function (response) {
                                    console.log("error PATCH on /layers");
                                }
                            });
                        });
                    }
                    stage.add(layer);
                });

                stage.add(layer);

                //console.log(stage);
                App.vent.trigger("initStage", {stage: stage});

                function select(node) {
                    //console.log(node);
                    deselect();

                    if (node.parent.nodeType = 'Kinetic.Group') {
                        var i, children = node.parent.children;
                        for (i = 1; i < children.length; i = i + 1) {
                            if (children[i].getName() === 'gripTL' ||
                                children[i].getName() === 'gripTC' ||
                                children[i].getName() === 'gripTR' ||
                                children[i].getName() === 'gripMR' ||
                                children[i].getName() === 'gripBR' ||
                                children[i].getName() === 'gripBC' ||
                                children[i].getName() === 'gripBL' ||
                                children[i].getName() === 'gripML' ||
                                children[i].getName() === 'gripR') {
                                    children[i].show();
                            }
                        }
                    }
                }

                function deselect() {
                    var i, j, children = layer.children;

                    for (i = 1; i < children.length; i = i + 1) {
                        var grandChildren = children[i].children;
                        //console.log(grandChildren);
                        if (grandChildren) {
                            for (j = 1; j < grandChildren.length; j = j + 1) {
                                if (grandChildren[j].getName() === 'gripTL' ||
                                    grandChildren[j].getName() === 'gripTC' ||
                                    grandChildren[j].getName() === 'gripTR' ||
                                    grandChildren[j].getName() === 'gripMR' ||
                                    grandChildren[j].getName() === 'gripBR' ||
                                    grandChildren[j].getName() === 'gripBC' ||
                                    grandChildren[j].getName() === 'gripBL' ||
                                    grandChildren[j].getName() === 'gripML' ||
                                    grandChildren[j].getName() === 'gripR') {
                                        grandChildren[j].hide();
                                        layer.draw();
                                }
                            }
                        }
                    }
                }
            }
            //console.log(this.sources);
            // call function to load layers
            loadImages(this.sources, initStage);
        }
    });
});