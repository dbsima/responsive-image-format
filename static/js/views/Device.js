/*global define, console*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.device,

        tagName: 'div',

        events : {
            'click #btnSave' : 'saveResolution'
        },

        initialize: function () {
            this.stage = "";
            this.listenTo(App.vent, "initStage", this.onInitStage);
            this.listenTo(App.vent, "updateStage", this.onUpdateStage);

            this.listenTo(App.vent, "changeDisplayInRenderer", this.onChangeDisplayInRenderer);

            var asset = this.model.toJSON();

            this.sources = {};
            this.sources['0'] = {id: '0', path: "../files/" + asset.id + ".png", timestamp: this.model.toJSON().timestamp};
            console.log(asset.id + ".png");

            //this.model.bind('change', this.onRender);
            this.listenTo(this.model, "change", this.changings);
        },

        changings: function () {
            console.log("change " + this.model.get("device"));
            //this.initialize();
            //this.render();
        },

        onChangeDisplayInRenderer: function (options) {
            console.log("here1" + options.device);
            this.model.set('device', options.device);

            // rerender the stage
            this.render();
        },

        onUpdateStage: function (options) {
            this.stage = options.stage;
            //console.log(options.stage);
        },

        postStage: function (assetID, dataUrl) {
            console.log('post stage ------');
            $.ajax({
                async: false,
                type: "POST",
                url: "/assets/" + assetID,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"image_resolution": dataUrl, "display_width": 1000, "display_height": 500}, null, '\t'),
                success: function (response) {
                    console.log("success POST on /assets/:assetID");
                    console.log(response);
                },
                error: function (response) {
                    console.log("error POST on /assets/:assetID");
                    console.log(response);
                }
            });
        },

        onInitStage: function (options) {
            this.stage = options.stage;
            var self = this;

            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var assetID = document.getElementById('btnSave').getAttribute('data-id');
                    console.log(assetID);

                    //self.postStage(assetID, dataUrl);
                }
            });
        },

        saveResolution: function () {
            console.log("save res");

            var self = this;
            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var assetID = document.getElementById('btnSave').getAttribute('data-id');
                    console.log(assetID);

                    self.postStage(assetID, dataUrl);
                }
            });
        },

        renderFile: function () {
            console.log("render");
            // Let us extract the value from the textbox now
        },

        onRender : function () {
            console.log("on render in select");
            function update(activeAnchor) {
                var activeHandle = activeAnchor;
                var group = activeHandle.getParent();

                var topLeft = group.find(".topLeft")[0],
                    topRight = group.find(".topRight")[0],
                    bottomRight = group.find(".bottomRight")[0],
                    bottomLeft = group.find(".bottomLeft")[0],
                    image = group.find(".image")[0],
                    activeHandleName = activeHandle.name(),
                    newWidth,
                    newHeight,
                    minWidth = 32,
                    minHeight = 32,
                    oldX,
                    oldY,
                    imageX,
                    imageY;

                // Update the positions of handles during drag.
                // This needs to happen so the dimension calculation can use the
                // handle positions to determine the new width/height.
                switch (activeHandleName) {
                case "topLeft":
                    oldY = topRight.y();
                    oldX = bottomLeft.x();
                    topRight.y(activeHandle.y());
                    bottomLeft.x(activeHandle.x());
                    break;
                case "topRight":
                    oldY = topLeft.y();
                    oldX = bottomRight.x();
                    topLeft.y(activeHandle.y());
                    bottomRight.x(activeHandle.x());
                    break;
                case "bottomRight":
                    oldY = bottomLeft.y();
                    oldX = topRight.x();
                    bottomLeft.y(activeHandle.y());
                    topRight.x(activeHandle.x());
                    break;
                case "bottomLeft":
                    oldY = bottomRight.y();
                    oldX = topLeft.x();
                    bottomRight.y(activeHandle.y());
                    topLeft.x(activeHandle.x());
                    break;
                }

                // Calculate new dimensions. Height is simply the dy of the handles.
                // Width is increased/decreased by a factor of how much the height changed.
                newHeight = bottomLeft.y() - topLeft.y();
                newWidth = image.width() * newHeight / image.height();

                // It's too small: move the active handle back to the old position
                if (newWidth < minWidth || newHeight < minHeight) {
                    activeHandle.y(oldY);
                    activeHandle.x(oldX);
                    switch (activeHandleName) {
                    case "topLeft":
                        topRight.y(oldY);
                        bottomLeft.x(oldX);
                        break;
                    case "topRight":
                        topLeft.y(oldY);
                        bottomRight.x(oldX);
                        break;
                    case "bottomRight":
                        bottomLeft.y(oldY);
                        topRight.x(oldX);
                        break;
                    case "bottomLeft":
                        bottomRight.y(oldY);
                        topLeft.x(oldX);
                        break;
                    }
                }

                newHeight = bottomLeft.y() - topLeft.y();
                newWidth = image.width() * newHeight / image.height();//for restricted resizing

                // Move the image to adjust for the new dimensions.
                // The position calculation changes depending on where it is anchored.
                // ie. When dragging on the right, it is anchored to the top left,
                //     when dragging on the left, it is anchored to the top right.
                if (activeHandleName === "topRight" || activeHandleName === "bottomRight") {
                    image.position({x: topLeft.x(), y: topLeft.y()});
                } else if (activeHandleName === "topLeft" || activeHandleName === "bottomLeft") {
                    image.position({x: topRight.x() - newWidth, y: topRight.y()});
                }

                imageX = image.x();
                imageY = image.y();
                console.log(image.getPosition());

                // Update handle positions to reflect new image dimensions
                topLeft.position({x: imageX, y: imageY});
                topRight.position({x: imageX + newWidth, y: imageY});
                bottomRight.position({x: imageX + newWidth, y: imageY + newHeight});
                bottomLeft.position({x: imageX, y: imageY + newHeight});

                // Set the image's size to the newly calculated dimensions
                if (newWidth && newHeight) {
                    image.size({width: newWidth, height: newHeight});

                    App.vent.trigger("showCurrentLayerSize", {
                        "currentLayerWidth": newWidth,
                        "currentLayerHeight" : newHeight
                    });
                }
            }

            var l = 10;

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

                    if (anchor.name() === 'topLeft' || anchor.name() === 'bottomRight') {
                        document.body.style.cursor = 'nwse-resize';
                    } else if (anchor.name() === 'topRight' || anchor.name() === 'bottomLeft') {
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

                group.add(anchor);
                anchor.hide();
            }

            function loadImages(sources, callback) {
                console.log("load images");
                var images = {},
                    loadedImages = 0,
                    numImages = 0;

                // count the number of images to load
                _.each(sources, function (val, key) {
                    if (val) {
                        numImages = numImages + 1;
                    }
                });

                _.each(sources, function (val, key) {
                    if (val) {
                        console.log(val.timestamp);
                        var id = key;

                        images[id] = new Image();
                        images[id].onload = function () {
                            console.log("image loaded " + val.timestamp);
                            // initStage only after all images are loaded
                            if (++loadedImages >= numImages) {
                                callback(images);
                            }
                        };
                        images[id].src = val.path + "?"+(new Date()).getTime();

                    }
                });
            }

            function initStage(images) {
                var stage_width, stage_height;
                if (images[0].width < $('#container').width() && images[0].height < $('#container').height()) {
                    stage_width = images[0].width;
                    stage_height = images[0].height;
                } else {
                    stage_width = $('#container').width();
                    stage_height = $('#container').height();
                }

                //console.log("here1 " + stage_width + "-" + $('#container').width());
                //console.log("here2 " + stage_height + "-" + $('#container').height());

                var stage = new Kinetic.Stage({
                    container: 'container',
                    width: stage_width,
                    height: stage_height
                });

                // send initial width and size
                App.vent.trigger("showInitialLayerSize", {
                    "initialLayerWidth": stage.getWidth(),
                    "initialLayerHeight" : stage.getHeight()
                });

                var layer = new Kinetic.Layer(),
                    bg = new Kinetic.Rect({
                        width: stage.getWidth(),
                        height: stage.getHeight(),
                        fill : 'grey',
                        x: 0,
                        y: 0
                    });
                layer.add(bg);

                layer.on('mousedown', function (e) {
                    var node = e.target;
                    select(node);
                });

                // For each layer create group and add anchors
                _.each(images, function (val, key) {
                    if (val) {
                        console.log(key);

                        var group = new Kinetic.Group({
                            x: 0,
                            y: 0,
                            draggable: true
                        });

                        // update W & H in Operations -> Resize
                        group.on('click', function () {
                            var image = group.find('.image')[0];

                            App.vent.trigger("showCurrentLayerSize", {
                                "currentLayerWidth": image.getWidth(),
                                "currentLayerHeight" : image.getHeight()
                            });
                        });

                        layer.add(group);
                        stage.add(layer);

                        var img = new Kinetic.Image({
                            x: 0,
                            y: 0,
                            image: images[key],
                            name: 'image'
                        });

                        group.add(img);
                        addAnchor(group, 0, 0, 'topLeft');
                        addAnchor(group, img.getWidth(), 0, 'topRight');
                        addAnchor(group, img.getWidth(), img.getHeight(), 'bottomRight');
                        addAnchor(group, 0, img.getHeight(), 'bottomLeft');

                        group.on('dragstart', function () {
                            this.moveToTop();
                        });

                        group.on('dragend', function () {
                            App.vent.trigger("updateStage", {stage: stage});
                            console.log(group.getPosition());
                        });
                    }
                });

                stage.add(layer);
                App.vent.trigger("initStage", {stage: stage});

                function select(node) {
                    deselect();

                    if (node.parent.nodeType = 'Kinetic.Group') {
                        var i, children = node.parent.children;
                        for (i = 1; i < children.length; i = i + 1) {
                            if (children[i].getName() === 'topLeft' ||
                                    children[i].getName() === 'topRight' ||
                                    children[i].getName() === 'bottomRight' ||
                                    children[i].getName() === 'bottomLeft') {
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
                                if (grandChildren[j].getName() === 'topLeft' ||
                                        grandChildren[j].getName() === 'topRight' ||
                                        grandChildren[j].getName() === 'bottomRight' ||
                                        grandChildren[j].getName() === 'bottomLeft') {
                                    grandChildren[j].hide();
                                    layer.draw();
                                }
                            }
                        }
                    }
                }
            }

            loadImages(this.sources, initStage);
        }
    });
});