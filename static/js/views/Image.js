/*global define, console*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.image,

        initialize: function () {
            console.log("initialize");
            this.listenTo(App.vent, "initStage", this.onInitStage);
            this.listenTo(App.vent, "updateStage", this.onUpdateStage);
            
            this.listenTo(this.model, "change", this.changings);
            this.listenTo(this.model, "sync", this.changings);
            
            var i, asset = this.model.toJSON();
            this.layers = asset.layers;
            this.assetID = asset.id;
            
            this.stage = "";
            this.sources = {};
            
            console.log(asset);
            for (i = 0; i < this.layers.length; i = i + 1) {
                console.log(this.layers[i].id);
                
                var layerModel = new LayerModel({path: this.layers[i].id}),
                    self = this;
                self.i = i;
                layerModel.fetch({
                    async: false,
                    success: function (layer) {
                        self.sources[String(self.layers[self.i].index)] = {
                            id: String(self.layers[self.i].id),
                            path: "../files/" + layer.get("id") + layer.get("type")
                        };
                    }
                });
            }
        },

        events : {
            'click #btnApply' : 'applyOperation',
            'click #btnSelect' : 'selectDisplay',
            'click #btnAddLayer' : 'addLayer'
        },
        
        changings: function () {
            console.log("change");
            //this.model.fetch();
            console.log(this.model.toJSON());
        },
        
        onUpdateStage: function (options) {
            this.stage = options.stage;
        },
        
        postStage: function (assetID, dataUrl) {
            $.ajax({
                async: "false",
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
                    console.log(response);
                }
            });
        },
        
        onInitStage: function (options) {
            this.stage = options.stage;
            var self = this;
            
            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var assetID = document.getElementById('btnApply').getAttribute('data-id');
                    console.log(assetID);
                    self.postStage(assetID, dataUrl);
                }
            });
        },
        
        applyOperation: function () {
            console.log("apply");
            
            var self = this;
            self.stage.toDataURL({
                callback: function (dataUrl) {
                    var assetID = document.getElementById('btnApply').getAttribute('data-id');
                    console.log(assetID);
                    self.postStage(assetID, dataUrl);
                }
            });
        },
        
        selectDisplay: function () {
            console.log("select");
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
            var assetID = document.getElementById('btnAddLayer').getAttribute('data-id');
            form_data.append("asset_id", assetID);
            
            var self = this;
            $.ajax({
                async: "false",
                url: "/layers",
                dataType: 'text',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,
                type: 'post',
                success: function (response) {
                    console.log("success POST on /layers");
                    console.log(response);
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
                    console.log(response);
                }
            });
        },
        
        onRender : function () {
            console.log(this.sources);
            // function for updating the stage when an anchor is dragged
            function update(activeAnchor) {
                var group = activeAnchor.getParent(),
                    
                    topLeft = group.find('.topLeft')[0],
                    topCenter = group.find('.topCenter')[0],
                    topRight = group.find('.topRight')[0],
                    middleRight = group.find('.middleRight')[0],
                    bottomRight = group.find('.bottomRight')[0],
                    bottomCenter = group.find('.bottomCenter')[0],
                    bottomLeft = group.find('.bottomLeft')[0],
                    middleLeft = group.find('.middleLeft')[0],
                    rotate = group.find('.rotate')[0],
                    image = group.find('.image')[0],
                    
                    anchorX = activeAnchor.x(),
                    anchorY = activeAnchor.y();
                
                // update anchor positions
                switch (activeAnchor.name()) {
                case 'topLeft':
                    topRight.y(anchorY);
                    topCenter.y(anchorY);
                    topCenter.x((topLeft.x() + topRight.x()) / 2);
                    bottomLeft.x(anchorX);
                    middleLeft.x(anchorX);
                    middleLeft.y((topLeft.y() + bottomLeft.y()) / 2);
                    middleRight.y((topRight.y() + bottomRight.y()) / 2);
                    bottomCenter.x((bottomLeft.x() + bottomRight.x()) / 2);
                    rotate.x((bottomLeft.x() + bottomRight.x()) / 2); 
                    break;
                        
                case 'topCenter':
                    topRight.y(anchorY);
                    topLeft.y(anchorY);
                    middleLeft.y((topLeft.y() + bottomLeft.y()) / 2);
                    middleRight.y((topRight.y() + bottomRight.y()) / 2);
                    break;
                        
                case 'topRight':
                    topLeft.y(anchorY);
                    topCenter.y(anchorY);
                    topCenter.x((topLeft.x() + topRight.x()) / 2);
                    bottomRight.x(anchorX);
                    middleRight.x(anchorX);
                    middleRight.y((topLeft.y() + bottomRight.y()) / 2);
                    bottomCenter.x((bottomLeft.x() + bottomRight.x()) / 2);
                    rotate.x((bottomLeft.x() + bottomRight.x()) / 2);    
                    middleLeft.y((topLeft.y() + bottomLeft.y()) / 2);
                    break;
                        
                case 'middleRight':
                    topRight.x(anchorX);
                    bottomRight.x(anchorX);
                    topCenter.x((topLeft.x() + topRight.x()) / 2);
                    bottomCenter.x((bottomLeft.x() + bottomRight.x()) / 2);
                    rotate.x((bottomLeft.x() + bottomRight.x()) / 2);    
                    break;
                        
                case 'bottomRight':
                    topCenter.x((topLeft.x() + topRight.x()) / 2);
                    bottomLeft.y(anchorY);
                    middleLeft.y((topLeft.y() + bottomLeft.y()) / 2);
                    bottomCenter.y(anchorY);
                    bottomCenter.x((bottomLeft.x() + bottomRight.x()) / 2);
                    rotate.y(anchorY + 50);
                    rotate.x((bottomLeft.x() + bottomRight.x()) / 2); 
                    topRight.x(anchorX);
                    middleRight.x(anchorX);
                    middleRight.y((topRight.y() + bottomRight.y()) / 2);
                    break;
                        
                case 'bottomCenter':
                    bottomRight.y(anchorY);
                    bottomLeft.y(anchorY);
                    middleLeft.y((topLeft.y() + bottomLeft.y()) / 2);
                    middleRight.y((topRight.y() + bottomRight.y()) / 2);
                    break;
                        
                case 'bottomLeft':
                    bottomRight.y(anchorY);
                    topLeft.x(anchorX);
                    middleLeft.x(anchorX);
                    middleLeft.y((topLeft.y() + bottomLeft.y()) / 2);
                    bottomCenter.y(anchorY);
                    bottomCenter.x((bottomLeft.x() + bottomRight.x()) / 2);
                    rotate.y(anchorY + 50);    
                    rotate.x((bottomLeft.x() + bottomRight.x()) / 2);    
                    middleRight.y((topRight.y() + bottomRight.y()) / 2);
                    topCenter.x((topLeft.x() + topRight.x()) / 2);
                    break;
                        
                case 'middleLeft':
                    topLeft.x(anchorX);
                    bottomLeft.x(anchorX);
                    topCenter.x((topLeft.x() + topRight.x()) / 2);
                    bottomCenter.x((bottomLeft.x() + bottomRight.x()) / 2);
                    rotate.x((bottomLeft.x() + bottomRight.x()) / 2);    
                    break;
                }
                // update the position of the image
                image.position({x: topLeft.x(), y: topLeft.y()});

                // compute the new width and height of the image
                var width = topRight.x() - topLeft.x(),
                    height = bottomLeft.y() - topLeft.y();

                // update the weight and height of the image
                if (width && height) {
                    image.size({width: width, height: height});
                    
                    App.vent.trigger("showCurrentLayerSize", {
                        "currentLayerWidth": width,
                        "currentLayerHeight" : height
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
                    
                    if (anchor.name() === 'topCenter' || anchor.name() === 'bottomCenter') {
                        document.body.style.cursor = 'ns-resize';
                    } else if (anchor.name() === 'middleLeft' || anchor.name() === 'middleRight') {
                        document.body.style.cursor = 'ew-resize';
                    } else if (anchor.name() === 'topLeft' || anchor.name() === 'bottomRight') {
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
                
                // set anchors topCenter and bottomCenter to move only on vertical
                if (anchor.name() === 'topCenter' || anchor.name() === 'bottomCenter') {
                    anchor.dragBoundFunc(function (pos) {
                        return {
                            x: this.getAbsolutePosition().x,
                            y: pos.y
                        }
                    });
                }         
                // set anchors middleLeft and middleRight to move only on horizontal
                if (anchor.name() === 'middleLeft' || anchor.name() === 'middleRight') {
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
                console.log(sources);
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
                        console.log(key);
                        var id = key;
                        
                        images[id] = new Image();
                        images[id].onload = function () {
                            // initStage only after all images are loaded
                            if (++loadedImages >= numImages) {
                                callback(images);
                            }
                        };
                        console.log(val.path);
                        images[id].src = val.path;
                    }
                });
            }
            // 
            function initStage(images) {
                
                var stage_width, stage_height;
                if (images[0].width < $('#container').width() && images[0].height < $('#container').height()) {
                    stage_width = images[0].width;
                    stage_height = images[0].height;
                } else {
                    stage_width = $('#container').width();
                    stage_height = $('#container').height();
                }
                
                //console.log("here" + stage_width + "-" + $('#container').height());
                
                var stage = new Kinetic.Stage({
                    container: 'container',
                    width: images[0].width,
                    height: images[0].height
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
                            var image = group.find('.image')[0];
                            
                            App.vent.trigger("showCurrentLayerSize", {
                                "currentLayerWidth": image.getWidth(),
                                "currentLayerHeight" : image.getHeight()
                            });
                        });
                        
                        layer.add(group);
                        
                        var img = new Kinetic.Image({
                            x: 0,
                            y: 0,
                            image: images[key],
                            name: 'image'
                        });
                        
                        group.add(img);
                        addAnchor(group, 0, 0, 'topLeft');
                        addAnchor(group, img.getWidth() / 2, 0, 'topCenter');
                        addAnchor(group, img.getWidth(), 0, 'topRight');
                        addAnchor(group, img.getWidth(), img.getHeight() / 2, 'middleRight');
                        addAnchor(group, img.getWidth(), img.getHeight(), 'bottomRight');
                        addAnchor(group, img.getWidth() / 2, img.getHeight(), 'bottomCenter');
                        addAnchor(group, 0, img.getHeight(), 'bottomLeft');
                        addAnchor(group, 0, img.getHeight() / 2, 'middleLeft');
                        
                        addAnchor(group, img.getWidth() / 2, img.getHeight() + 50, 'rotate');
                        
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
                            if (children[i].getName() === 'topLeft' ||
                                    children[i].getName() === 'topCenter' ||
                                    children[i].getName() === 'topRight' ||
                                    children[i].getName() === 'middleRight' ||
                                    children[i].getName() === 'bottomRight' ||
                                    children[i].getName() === 'bottomCenter' ||
                                    children[i].getName() === 'bottomLeft' ||
                                    children[i].getName() === 'middleLeft' ||
                                    children[i].getName() === 'rotate') {
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
                                        grandChildren[j].getName() === 'topCenter' ||
                                        grandChildren[j].getName() === 'topRight' ||
                                        grandChildren[j].getName() === 'middleRight' ||
                                        grandChildren[j].getName() === 'bottomRight' ||
                                        grandChildren[j].getName() === 'bottomCenter' ||
                                        grandChildren[j].getName() === 'bottomLeft' ||
                                        grandChildren[j].getName() === 'middleLeft' ||
                                        grandChildren[j].getName() === 'rotate') {
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