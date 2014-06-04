/*global define, console*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.image,

        initialize: function () {
            console.log("initialize");
            this.listenTo(App.vent, "initStage", this.onInitStage);
            this.listenTo(App.vent, "updateStage", this.onUpdateStage);

            this.listenTo(App.vent, "afterLayerDeleted", this.onLayerDeleted);

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
                        console.log("layer id " + layers[i].id + layers[i].type);
                        this.sources[i] = {
                            id: String(layers[i].id),
                            path: "../files/" + layers[i].id + layers[i].type,
                            type: layers[i].type
                        };
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
            'click #btnAddLayer' : 'addLayer'
        },

        onLayerDeleted: function (options) {
            console.log("layer deleted");
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
                    console.log("success POST on /assets/:assetID");
                    console.log(response);

                },
                error: function (response) {
                    console.log("error POST on /assets/:assetID");
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
            console.log("apply");

            var self = this;
            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var asset_id = document.getElementById('btnApply').getAttribute('data-id');
                    self.postStage(asset_id, dataUrl);
                }
            });
        },

        selectDisplay: function () {
            //console.log("select");
        },

        addLayer: function () {
            console.log("addLayer");
            // Getting the properties of file from file field
            var file_data = $("#layer").prop("files")[0];
            // Creating object of FormData class
            var form_data = new FormData();
            // Appending parameter named file with properties of file_field to form_data
            form_data.append("file", file_data);
            // Appending parameter named asset_id with current asset_id
            var assetID = document.getElementById('btnApply').getAttribute('data-id');

            if (file_data) {
                //console.log("asdadsa"+ assetID);
                form_data.append("asset_id", assetID);
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
                        console.log("success POST on /layers");
                        //console.log(response);
                        var that = self;
                        self.model.fetch({
                            success: function (layer) {
                                // lot of hacking in here
                                that.initialize();
                                that.render();
                                console.log("success fetching layer");
                            }
                        });
                    },
                    error: function (response) {
                        console.log("error POST on /layers");
                        //console.log(response);
                    }
                });
            } else {
                console.log("no file uploaded");
            }
        },

        onRender : function () {
            //console.log(this.sources);
            // function for updating the stage when an anchor is dragged
            function update(activeAnchor) {
                var group = activeAnchor.getParent(),

                    handleTL = group.find('.handleTL')[0],
                    handleTC = group.find('.handleTC')[0],
                    handleTR = group.find('.handleTR')[0],
                    handleMR = group.find('.handleMR')[0],
                    handleBR = group.find('.handleBR')[0],
                    handleBC = group.find('.handleBC')[0],
                    handleBL = group.find('.handleBL')[0],
                    handleML = group.find('.handleML')[0],
                    handleR = group.find('.handleR')[0],
                    shape = group.find('.image')[0],

                    anchorX = activeAnchor.x(),
                    anchorY = activeAnchor.y();

                // update anchor positions
                switch (activeAnchor.name()) {
                case 'handleTL':
                    handleTR.y(anchorY);
                    handleTC.y(anchorY);
                    handleTC.x((handleTL.x() + handleTR.x()) / 2);
                    handleBL.x(anchorX);
                    handleML.x(anchorX);
                    handleML.y((handleTL.y() + handleBL.y()) / 2);
                    handleMR.y((handleTR.y() + handleBR.y()) / 2);
                    handleBC.x((handleBL.x() + handleBR.x()) / 2);
                    handleR.x((handleBL.x() + handleBR.x()) / 2);
                    break;

                case 'handleTC':
                    handleTR.y(anchorY);
                    handleTL.y(anchorY);
                    handleML.y((handleTL.y() + handleBL.y()) / 2);
                    handleMR.y((handleTR.y() + handleBR.y()) / 2);
                    break;

                case 'handleTR':
                    handleTL.y(anchorY);
                    handleTC.y(anchorY);
                    handleTC.x((handleTL.x() + handleTR.x()) / 2);
                    handleBR.x(anchorX);
                    handleMR.x(anchorX);
                    handleMR.y((handleTL.y() + handleBR.y()) / 2);
                    handleBC.x((handleBL.x() + handleBR.x()) / 2);
                    handleR.x((handleBL.x() + handleBR.x()) / 2);
                    handleML.y((handleTL.y() + handleBL.y()) / 2);
                    break;

                case 'handleMR':
                    handleTR.x(anchorX);
                    handleBR.x(anchorX);
                    handleTC.x((handleTL.x() + handleTR.x()) / 2);
                    handleBC.x((handleBL.x() + handleBR.x()) / 2);
                    handleR.x((handleBL.x() + handleBR.x()) / 2);
                    break;

                case 'handleBR':
                    handleTC.x((handleTL.x() + handleTR.x()) / 2);
                    handleBL.y(anchorY);
                    handleML.y((handleTL.y() + handleBL.y()) / 2);
                    handleBC.y(anchorY);
                    handleBC.x((handleBL.x() + handleBR.x()) / 2);
                    handleR.y(anchorY + 50);
                    handleR.x((handleBL.x() + handleBR.x()) / 2);
                    handleTR.x(anchorX);
                    handleMR.x(anchorX);
                    handleMR.y((handleTR.y() + handleBR.y()) / 2);
                    break;

                case 'handleBC':
                    handleBR.y(anchorY);
                    handleBL.y(anchorY);
                    handleML.y((handleTL.y() + handleBL.y()) / 2);
                    handleMR.y((handleTR.y() + handleBR.y()) / 2);
                    break;

                case 'handleBL':
                    handleBR.y(anchorY);
                    handleTL.x(anchorX);
                    handleML.x(anchorX);
                    handleML.y((handleTL.y() + handleBL.y()) / 2);
                    handleBC.y(anchorY);
                    handleBC.x((handleBL.x() + handleBR.x()) / 2);
                    handleR.y(anchorY + 50);
                    handleR.x((handleBL.x() + handleBR.x()) / 2);
                    handleMR.y((handleTR.y() + handleBR.y()) / 2);
                    handleTC.x((handleTL.x() + handleTR.x()) / 2);
                    break;

                case 'handleML':
                    handleTL.x(anchorX);
                    handleBL.x(anchorX);
                    handleTC.x((handleTL.x() + handleTR.x()) / 2);
                    handleBC.x((handleBL.x() + handleBR.x()) / 2);
                    handleR.x((handleBL.x() + handleBR.x()) / 2);
                    break;
                }
                // update the position of the image
                shape.position({x: handleTL.x(), y: handleTL.y()});

                // compute the new width and height of the image
                var width = handleTR.x() - handleTL.x(),
                    height = handleBL.y() - handleTL.y();

                // update the weight and height of the image
                if (width && height) {
                    shape.size({width: width, height: height});
                    console.log(shape);
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
                        radius: 8,
                        stroke: '#666',
                        fill: '#ddd',
                        opacity: 0.7,
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
                    var layer = this.getLayer();

                    if (anchor.name() === 'handleTC' || anchor.name() === 'handleBC') {
                        document.body.style.cursor = 'ns-resize';
                    } else if (anchor.name() === 'handleML' || anchor.name() === 'handleMR') {
                        document.body.style.cursor = 'ew-resize';
                    } else if (anchor.name() === 'handleTL' || anchor.name() === 'handleBR') {
                        document.body.style.cursor = 'nwse-resize';
                    } else if (anchor.name() === 'handleTR' || anchor.name() === 'handleBL') {
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

                // set anchors handleTC and handleBC to move only on vertical
                if (anchor.name() === 'handleTC' || anchor.name() === 'handleBC') {
                    anchor.dragBoundFunc(function (pos) {
                        return {
                            x: this.getAbsolutePosition().x,
                            y: pos.y
                        }
                    });
                }
                // set anchors handleML and handleMR to move only on horizontal
                if (anchor.name() === 'handleML' || anchor.name() === 'handleMR') {
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
                    if (val && val.type !== "smart") {
                        numImages = numImages + 1;
                    }
                });

                _.each(sources, function (val, key) {
                    if (val) {
                        //console.log(val.path + " - " + val.id);
                        var id = key;
                        console.log(val.type);
                        images[id] = new Image();
                        if (val.type !== "smart") {
                            images[id].onload = function () {
                                // initStage only after all images are loaded
                                if (++loadedImages >= numImages) {
                                    console.log(images);
                                    callback(images);
                                }
                            };
                            //console.log(val.path);
                            images[id].src = val.path;
                        }
                        images[id].type = val.type;
                        images[id].name = val.id;
                        images[id].id = val.id;
                    }
                });
            }
            //
            function initStage(images) {
                console.log(images);
                var stage_width, stage_height;
                if (images[0].width < $('#container').width() && images[0].height < $('#container').height()) {
                    stage_width = images[0].width;
                    stage_height = images[0].height;
                } else {
                    stage_width = $('#container').width();
                    stage_height = $('#container').height();
                }

                var stage = new Kinetic.Stage({
                    container: 'container',
                    width: images[0].width,
                    height: images[0].height
                });

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
                    select(node);
                });
                // For each layer create a group and add anchors
                _.each(images, function (val, key) {
                    if (val) {
                        var group = new Kinetic.Group({
                            x: 0,
                            y: 0,
                            draggable: true
                        });
                        // update W & H in Operations -> Resize
                        group.on('click', function () {
                            var shape = group.find('.image')[0];

                            App.vent.trigger("showCurrentLayerSize", {
                                "current_width": shape.getWidth(),
                                "current_height" : shape.getHeight(),
                                "current_layer": shape.getId(),
                                "current_asset": document.getElementById('btnAddLayer').getAttribute('data-id')
                            });
                        });

                        layer.add(group);

                        var shape;
                        if (val.type === 'smart') {
                            shape = new Kinetic.Rect({
                                width: 100,
                                height: 100,
                                fill : '',
                                name: 'image',
                                stroke: 'grey',
                                strokeWidth: 1,
                                id: images[key].name,
                                x: 0,
                                y: 0
                            });
                        } else {
                            shape = new Kinetic.Image({
                                x: 0,
                                y: 0,
                                image: images[key],
                                name: 'image',
                                id: images[key].name
                            });
                        }

                        group.add(shape);
                        addAnchor(group, 0, 0, 'handleTL');
                        addAnchor(group, shape.getWidth() / 2, 0, 'handleTC');
                        addAnchor(group, shape.getWidth(), 0, 'handleTR');
                        addAnchor(group, shape.getWidth(), shape.getHeight() / 2, 'handleMR');
                        addAnchor(group, shape.getWidth(), shape.getHeight(), 'handleBR');
                        addAnchor(group, shape.getWidth() / 2, shape.getHeight(), 'handleBC');
                        addAnchor(group, 0, shape.getHeight(), 'handleBL');
                        addAnchor(group, 0, shape.getHeight() / 2, 'handleML');

                        addAnchor(group, shape.getWidth() / 2, shape.getHeight() + 50, 'handleR');

                        group.on('dragstart', function () {
                            this.moveToTop();
                        });

                        group.on('dragend', function () {
                            App.vent.trigger("updateStage", {stage: stage});
                            console.log(group.getPosition());
                        });
                    }
                    stage.add(layer);
                });

                stage.add(layer);
                App.vent.trigger("initStage", {stage: stage});

                function select(node) {
                    deselect();

                    if (node.parent.nodeType = 'Kinetic.Group') {
                        var i, children = node.parent.children;
                        for (i = 1; i < children.length; i = i + 1) {
                            if (children[i].getName() === 'handleTL' ||
                                    children[i].getName() === 'handleTC' ||
                                    children[i].getName() === 'handleTR' ||
                                    children[i].getName() === 'handleMR' ||
                                    children[i].getName() === 'handleBR' ||
                                    children[i].getName() === 'handleBC' ||
                                    children[i].getName() === 'handleBL' ||
                                    children[i].getName() === 'handleML' ||
                                    children[i].getName() === 'handleR') {
                                children[i].show();
                            }
                        }
                    }
                }

                function deselect() {
                    var i, j, children = layer.children;

                    for (i = 1; i < children.length; i = i + 1) {
                        var grandChildren = children[i].children;

                        if (grandChildren) {
                            for (j = 1; j < grandChildren.length; j = j + 1) {
                                if (grandChildren[j].getName() === 'handleTL' ||
                                        grandChildren[j].getName() === 'handleTC' ||
                                        grandChildren[j].getName() === 'handleTR' ||
                                        grandChildren[j].getName() === 'handleMR' ||
                                        grandChildren[j].getName() === 'handleBR' ||
                                        grandChildren[j].getName() === 'handleBC' ||
                                        grandChildren[j].getName() === 'handleBL' ||
                                        grandChildren[j].getName() === 'handleML' ||
                                        grandChildren[j].getName() === 'handleR') {
                                    grandChildren[j].hide();
                                    layer.draw();
                                }
                            }
                        }
                    }
                }
            }
            // call function to load layers
            loadImages(this.sources, initStage);
        }
    });
});