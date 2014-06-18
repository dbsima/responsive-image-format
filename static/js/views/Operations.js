/*global define*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'bootstrap', 'models/Layer', 'select', 'slider', 'fileInput'], function ($, App, Marionette, vent, templates, bootstrap, LayerModel, Select, Slider, FileInput) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.operations,

        tagName: 'div',

        events : {
            'click #btnHideLayer' : 'hideLayer',
            'click #btnDeleteLayer' : 'deleteLayer',
            'click #openSmartShape': 'initSmartShape',
            'change #chooseShape': 'changeShape',
            'change #chooseGradient': 'changeGradient',
            'change #chooseBlending': 'changeBlending',
            'change #chooseOpacity': 'changeOpacity',
            'change #imageToCompose': 'changeImage',
            'click #btnOpenModal': 'onOpenModal',
        },

        initialize: function (options) {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(App.vent, "showInitialLayerSize", this.onLayerInit);
            this.listenTo(App.vent, "showCurrentLayerSize", this.onLayerSizeChange);
            this.asset_id = options.asset_id;
            this.isShapeOpen = false;

            this.sources = {};
            //console.log(this.model);
        },

        onOpenModal : function() {
            console.log("on open modal");

            console.log(this.model);

            this.sources['0'] = {
                id: '0',
                path: "../files/" + this.model.get('current_layer') + this.model.get('ext'),
                width: this.model.get('current_width'),
                height: this.model.get('current_height')
            };

            this.onTest();
            // show modal
            $('#myModal').modal('show');
        },

        changeImage: function(options) {
            var isSelected = document.getElementById('imageToCompose').value;

            if (isSelected) {
                console.log($('#imageToCompose')[0].files[0]);
                var form_data = new FormData();
                form_data.append("image", "bla");
                form_data.append('file', $('#imageToCompose')[0].files[0] );
                var self = this;
                $.ajax({
                    url: "/layers/" + self.model.get('current_layer'),
                    dataType: 'text',
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: form_data,
                    type: 'PATCH',
                    success: function (response) {
                        $('#myModal').modal('show');
                        // rerender stage after new smart shape added
                        //self.initialize();
                        //self.render();
                    },
                    error: function (response) {
                        console.log("error POST on /layers");
                        //console.log(response);
                    }
                });
            }
        },

        changeShape: function (options) {
            console.log("change shape");

            var elt = document.getElementById('chooseShape');
            if (elt.selectedIndex != -1) {
                //console.log(elt.options[elt.selectedIndex].value);
                //this.model.set('shape', elt.options[elt.selectedIndex].value);
                this.selectedShape = elt.options[elt.selectedIndex].value;
                var self = this;
                console.log(self);
                $.ajax({
                    url: "/layers/" + self.model.get('current_layer'),
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"shape": self.selectedShape}),
                    type: 'PATCH',
                    success: function (response) {
                        console.log("success PATCH on /layers");
                        App.vent.trigger("afterLayerChanged", {"shape": "changed"});
                    },
                    error: function (response) {
                        console.log("error PATCH on /layers");
                    }
                });
            }
        },

        changeOpacity: function (options) {
            console.log("change opacity");

            this.selectedOpacity = document.getElementById('chooseOpacity').value;
            console.log('opacity is ' + this.selectedOpacity/10);

            var self = this;
            //console.log(self);
            $.ajax({
                url: "/layers/" + self.model.get('current_layer'),
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"opacity": self.selectedOpacity/10}),
                type: 'PATCH',
                success: function (response) {
                    console.log("success PATCH on /layers");
                    App.vent.trigger("afterLayerChanged", {"opacity": "changed"});
                },
                error: function (response) {
                    console.log("error PATCH on /layers");
                }
            });
        },

        changeGradient: function (options) {
            console.log("change gradient");

            var elt = document.getElementById('chooseGradient');
            if (elt.selectedIndex != -1) {
                //this.model.set('gradient', elt.options[elt.selectedIndex].value);
                //console.log(elt.options[elt.selectedIndex].value);
                this.selectedGradient = elt.options[elt.selectedIndex].value;
                var self = this;
                $.ajax({
                    url: "/layers/" + self.model.get('current_layer'),
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"gradient": self.selectedGradient}),
                    type: 'PATCH',
                    success: function (response) {
                        console.log("success PATCH on /layers");
                        App.vent.trigger("afterLayerChanged", {"gradient": "changed"});
                    },
                    error: function (response) {
                        console.log("error PATCH on /layers");
                    }
                });
            }
        },

        changeBlending: function (options) {
            console.log("change blending");

            var elt = document.getElementById('chooseBlending');
            if (elt.selectedIndex != -1) {
                //this.model.set('blending', elt.options[elt.selectedIndex].value);
                //console.log(elt.options[elt.selectedIndex].value);
                this.selectedBlending = elt.options[elt.selectedIndex].value;
                var self = this;
                $.ajax({
                    url: "/layers/" + self.model.get('current_layer'),
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"blending": self.selectedBlending}),
                    type: 'PATCH',
                    success: function (response) {
                        console.log("success PATCH on /layers");
                        App.vent.trigger("afterLayerChanged", {"blending": "changed"});
                    },
                    error: function (response) {
                        console.log("error PATCH on /layers");
                    }
                });
            }
        },

        hideLayer : function () {
            var layer_id = document.getElementById('btnHideLayer').getAttribute('data-id');
            console.log("hide layer" + layer_id);
        },

        deleteLayer : function () {
            var layerModel = new LayerModel({path: this.model.get('current_layer')});

            //console.log("delete layer " + this.model.get('current_layer'));
            // console.log("delete asset " + this.model.get('current_asset'));
            var self = this;
            $.ajax({
                async: false,
                url: "/layers/" + self.model.get('current_layer'),
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"asset_id": self.model.get("current_asset")}),
                type: 'DELETE',
                success: function (response) {
                    console.log("success POST on /layers");
                    console.log(response);
                    //console.log(response);
                    App.vent.trigger("afterLayerChanged", {"layer": "deleted"});
                },
                error: function (response) {
                    console.log("error POST on /layers");
                }
            });
        },

        onLayerInit: function (options) {
            options = options || {};
            //console.log(options);
            if (options.initial_width && options.initial_height) {
                //
                this.model.set('initial_width', options.initial_width);
                this.model.set('initial_height', options.initial_height);

                // the current size is equal with the initial size
                this.model.set('current_width', options.initial_width);
                this.model.set('current_height', options.initial_height);
            }
        },

        onLayerSizeChange: function (options) {
            options = options || {};
            this.options = options;
            //console.log(this.model);
            if (options.current_width && options.current_height && options.current_layer) {
                this.model.set('current_width', options.current_width);
                this.model.set('current_height', options.current_height);
                this.model.set('current_layer', options.current_layer);
                this.model.set('current_asset', options.current_asset);
                this.model.set('shape', options.shape);
                this.model.set('opacity', options.opacity);
                this.model.set('gradient', options.gradient);
                this.model.set('blending', options.blending);
                this.model.set('ext', options.ext);
                this.model.set('type', options.type);
            }
        },

        onShow: function (options) {
            console.log('here4');
            $('.selectpicker').selectpicker({
                'selectedText': 'cat'
            });
        },

        onTest : function () {
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

                    /*
                    App.vent.trigger("showCurrentImageSize", {
                        "currentImageWidth": newWidth,
                        "currentImageHeight" : newHeight
                    });*/
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
                        images[id].stage_width = val.width;
                        images[id].stage_height = val.height;
                    }
                });
            }

            function initStage(images) {
                var stage_width, stage_height;

                stage_width = images[0].stage_width;
                stage_height = images[0].stage_height;

                var stage = new Kinetic.Stage({
                    container: 'modal-container',
                    width: stage_width,
                    height: stage_height
                });

                // send initial width and size
                /*
                App.vent.trigger("showInitialLayerSize", {
                    "initialLayerWidth": stage.getWidth(),
                    "initialLayerHeight" : stage.getHeight()
                });*/

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
                            /*
                            App.vent.trigger("showCurrentLayerSize", {
                                "currentLayerWidth": image.getWidth(),
                                "currentLayerHeight" : image.getHeight()
                            });*/
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
                            //App.vent.trigger("updateStage", {stage: stage});
                            //console.log(group.getPosition());
                        });
                    }
                });

                stage.add(layer);
                //App.vent.trigger("initStage", {stage: stage});

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