/*global define, console*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.device,

        tagName: 'div',

        events : {
            'click #btnSave' : 'saveResolution',
            'click #btnShowVersion' : 'showVersion',
            'click #btnDeleteVersion' : 'deleteVersion'
        },

        initialize: function () {
            this.stage = "";
            this.listenTo(App.vent, "initStage", this.onInitStage);
            this.listenTo(App.vent, "updateStage", this.onUpdateStage);

            this.listenTo(App.vent, "showCurrentImageSize", this.onShowCurrentImageSize);


            this.listenTo(App.vent, "changeDisplayInRenderer", this.onChangeDisplayInRenderer);

            this.asset = this.model.toJSON();

            this.versionWidth = "";
            this.versionHeight = "";

            this.sources = {};
            this.sources['0'] = {id: '0', path: "../files/" + this.asset.id + this.asset.type};

            this.versions = {};
            var self = this;
            $.ajax({
                async: false,
                type: "GET",
                url: "/versionsOfAsset/" + self.asset.id,
                dataType: 'json',
                success: function (versions) {
                    console.log("success GET on /versionsOfAsset/assetId");
                    //console.log(layers);
                    var i;
                    for (i = 0; i < versions.length; i = i + 1) {
                        console.log("versions id " + versions[i].id + versions[i].ext);
                        this.versions[i] = {
                            id: String(versions[i].id),
                            display_w: versions[i].display_width,
                            display_h: versions[i].display_height,
                            path: "../files/" + versions[i].id + versions[i].ext
                        };
                    }
                }.bind(this),
                error: function (response) {
                    console.log("error GET on /layers with asset_id in json");
                }
            });
            this.model.set('versions', this.versions);
            console.log(this.versions);
        },

        onShowCurrentImageSize: function (options) {
            this.versionWidth = options.currentImageWidth | 0;
            this.versionHeight = options.currentImageHeight | 0;

            console.log(this.versionWidth + "+" + this.versionHeight);
        },

        showVersion: function (event) {
            console.log("show version");
            console.log(event.currentTarget.dataset.id);
            this.model.set("active_v", event.currentTarget.dataset.id);

            this.sources['0'] = {id: '0', path: event.currentTarget.dataset.id};

            // rerender the stage
            this.render()
        },

        deleteVersion: function (event) {
            console.log("delete version");
            console.log(event.currentTarget.dataset.id);

            var self = this;
            $.ajax({
                async: false,
                url: "/versions/" + event.currentTarget.dataset.id,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"asset_id": self.asset.id}),
                type: 'DELETE',
                success: function (response) {
                    console.log("success DELETE on /versions");
                    console.log(response);
                    //console.log(response);
                    //App.vent.trigger("afterLayerDeleted", {"layer": "deleted"});
                },
                error: function (response) {
                    console.log("error POST on /layers");
                }
            });
            //this.model.set("active_v", "");
        },

        onChangeDisplayInRenderer: function (options) {
            //console.log("here1" + options.device);
            this.model.set('device', options.device);

            //console.log(options.device);

            if (options.device === "md-device-1") {
                this.model.set('display_w', this.model.get('desktop_w'));
                this.model.set('display_h', this.model.get('desktop_h'));
            } else if (options.device === "md-device-2") {
                this.model.set('display_w', this.model.get('laptop_w'));
                this.model.set('display_h', this.model.get('laptop_h'));
            } else if (options.device === "md-device-3") {
                this.model.set('display_w', this.model.get('tablet_w'));
                this.model.set('display_h', this.model.get('tablet_h'));
            } else if (options.device === "md-device-3 md-rotated") {
                this.model.set('display_w', this.model.get('tablet_h'));
                this.model.set('display_h', this.model.get('tablet_w'));
            } else if (options.device === "md-device-4") {
                this.model.set('display_w', this.model.get('phone_w'));
                this.model.set('display_h', this.model.get('phone_h'));
            } else if (options.device === "md-device-4 md-rotated") {
                this.model.set('display_w', this.model.get('phone_h'));
                this.model.set('display_h', this.model.get('phone_w'));
            } else {
                console.log("error: no options.device in onChangeDisplayInRenderer");
            }
            // rerender the stage
            this.render();
        },

        onUpdateStage: function (options) {
            this.stage = options.stage;
            //console.log(options.stage);
        },

        postStage: function (assetID, deviceWidth, deviceHeight, versionWidth, versionHeight, dataUrl) {
            //console.log('post stage ------');
            $.ajax({
                async: false,
                type: "POST",
                url: "/assets/" + assetID,
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"image_resolution": dataUrl,
                                      "display_width": deviceWidth,
                                      "display_height": deviceHeight,
                                      "version_w": versionWidth,
                                      "version_h": versionHeight}, null, '\t'),
                success: function (response) {
                    console.log("success POST on /assets/:assetID");
                    //console.log(response);
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
                    var assetID = document.getElementById('btnSave').getAttribute('data-id');
                    //console.log(assetID);

                    //self.postStage(assetID, dataUrl);
                }
            });
        },

        saveResolution: function () {
            //console.log("save res");

            var self = this;
            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var assetID = document.getElementById('btnSave').getAttribute('data-id');
                    var deviceWidth = document.getElementById('btnSave').getAttribute('data-width');
                    var deviceHeight = document.getElementById('btnSave').getAttribute('data-height');
                    //console.log(assetID + "-" + deviceWidth + "-" + deviceHeight);

                    self.postStage(assetID, deviceWidth, deviceHeight, self.versionWidth, self.versionHeight, dataUrl);
                }
            });
        },

        renderFile: function () {
            //console.log("render");
            // Let us extract the value from the textbox now
        },

        onRender : function () {
            //console.log("on render in select");
            function update(activeAnchor) {
                var activeGrip = activeAnchor;
                var group = activeGrip.getParent();

                var gripTL = group.find(".gripTL")[0],
                    gripTR = group.find(".gripTR")[0],
                    gripBR = group.find(".gripBR")[0],
                    gripBL = group.find(".gripBL")[0],
                    image = group.find(".image")[0],
                    activeGripName = activeGrip.name(),
                    newWidth,
                    newHeight,
                    minWidth = 10,
                    minHeight = 10,
                    oldX,
                    oldY,
                    imageX,
                    imageY;

                // Update the positions of grips during drag.
                // This needs to happen so the dimension calculation can use the
                // grip positions to determine the new width/height.
                switch (activeGripName) {
                case "gripTL":
                    oldY = gripTR.y();
                    oldX = gripBL.x();
                    gripTR.y(activeGrip.y());
                    gripBL.x(activeGrip.x());
                    break;
                case "gripTR":
                    oldY = gripTL.y();
                    oldX = gripBR.x();
                    gripTL.y(activeGrip.y());
                    gripBR.x(activeGrip.x());
                    break;
                case "gripBR":
                    oldY = gripBL.y();
                    oldX = gripTR.x();
                    gripBL.y(activeGrip.y());
                    gripTR.x(activeGrip.x());
                    break;
                case "gripBL":
                    oldY = gripBR.y();
                    oldX = gripTL.x();
                    gripBR.y(activeGrip.y());
                    gripTL.x(activeGrip.x());
                    break;
                }

                // Calculate new dimensions. Height is simply the dy of the grips.
                // Width is increased/decreased by a factor of how much the height changed.
                newHeight = gripBL.y() - gripTL.y();
                newWidth = image.width() * newHeight / image.height();

                // If the new resolution is lower than 1x1 or greater than the
                // original resolution of the image, move the cursor back
                if (newWidth < minWidth || newHeight < minHeight /*|| newWidth > image.width() || newHeight > image.height()*/) {
                    activeGrip.y(oldY);
                    activeGrip.x(oldX);
                    switch (activeGripName) {
                    case "gripTL":
                        gripTR.y(oldY);
                        gripBL.x(oldX);
                        break;
                    case "gripTR":
                        gripTL.y(oldY);
                        gripBR.x(oldX);
                        break;
                    case "gripBR":
                        gripBL.y(oldY);
                        gripTR.x(oldX);
                        break;
                    case "gripBL":
                        gripBR.y(oldY);
                        gripTL.x(oldX);
                        break;
                    }
                }

                newHeight = gripBL.y() - gripTL.y();
                newWidth = image.width() * newHeight / image.height();//for restricted resizing

                // Move the image to adjust for the new dimensions.
                // The position calculation changes depending on where it is anchored.
                // ie. When dragging on the right, it is anchored to the top left,
                //     when dragging on the left, it is anchored to the top right.
                if (activeGripName === "gripTR" || activeGripName === "gripBR") {
                    image.position({x: gripTL.x(), y: gripTL.y()});
                } else if (activeGripName === "gripTL" || activeGripName === "gripBL") {
                    image.position({x: gripTR.x() - newWidth, y: gripTR.y()});
                }

                imageX = image.x();
                imageY = image.y();
                //console.log(image.getPosition());

                // Update grip positions to reflect new image dimensions
                gripTL.position({x: imageX, y: imageY});
                gripTR.position({x: imageX + newWidth, y: imageY});
                gripBR.position({x: imageX + newWidth, y: imageY + newHeight});
                gripBL.position({x: imageX, y: imageY + newHeight});

                // Set the image's size to the newly calculated dimensions
                if (newWidth && newHeight) {
                    image.size({width: newWidth, height: newHeight});

                    App.vent.trigger("showCurrentImageSize", {
                        "currentImageWidth": newWidth,
                        "currentImageHeight" : newHeight
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

                    if (anchor.name() === 'gripTL' || anchor.name() === 'gripBR') {
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

                group.add(anchor);
                anchor.hide();
            }

            function loadImages(sources, callback) {
                //console.log("load images");
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
                        //console.log(val.timestamp);
                        var id = key;

                        images[id] = new Image();
                        images[id].onload = function () {
                            //console.log("image loaded " + val.timestamp);
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
                        fill : '',
                        x: 0,
                        y: 0
                    });
                layer.add(bg);

                layer.on('mousedown', function (e) {
                    var node = e.target;
                    console.log(node);
                    select(node);
                });

                // For each layer create group and add anchors
                _.each(images, function (val, key) {
                    if (val) {
                        //console.log(key);

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
                        addAnchor(group, 0, 0, 'gripTL');
                        addAnchor(group, img.getWidth(), 0, 'gripTR');
                        addAnchor(group, img.getWidth(), img.getHeight(), 'gripBR');
                        addAnchor(group, 0, img.getHeight(), 'gripBL');

                        group.on('dragstart', function () {
                            this.moveToTop();
                        });

                        group.on('dragend', function () {
                            App.vent.trigger("updateStage", {stage: stage});
                            //console.log(group.getPosition());
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
                            if (children[i].getName() === 'gripTL' ||
                                    children[i].getName() === 'gripTR' ||
                                    children[i].getName() === 'gripBR' ||
                                    children[i].getName() === 'gripBL') {
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
                                if (grandChildren[j].getName() === 'gripTL' ||
                                        grandChildren[j].getName() === 'gripTR' ||
                                        grandChildren[j].getName() === 'gripBR' ||
                                        grandChildren[j].getName() === 'gripBL') {
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