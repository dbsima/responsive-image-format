define(['jquery', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.image,

        initialize: function (options) {
            this.options = options;
            //console.log(this.model.toJSON());
            
            var asset = this.model.toJSON();
            this.layers = asset["layers"];
            
            this.sources = {};
            
            var i;
            for (i = 0; i < this.layers.length; i = i + 1) {
                console.log(this.layers[i]["id"]);
                
                var layerModel = new LayerModel({path: this.layers[i]["id"]});

                var self = this;
                self.i = i;
                layerModel.fetch({
                    async: false,
                    success: function (layer) {
                        
                        //console.log("layers -|" + layer.get("name") + "|" + self.layers[self.i]["id"]);    

                        self.sources['' + self.layers[self.i]["index"]] = {
                            id: "" + self.layers[self.i]["id"]+ "",
                            path: "../uploads/" + layer.get("name") + layer.get("type")
                        };
                        
                        self.sources['' + 1] = {
                            id: "59df9e20-a3b5-4402-aaa4-b09f891006e8",
                            path: "../uploads/" + layer.get("name") + layer.get("type")
                        };
                    }
                });
            }   
        },

        events : {
            'click #btnApply' : 'applyOperation',
            'click #btnSelect' : 'selectDisplay',
            'click #btnRender' : 'renderFile'
        },
        
        applyOperation: function () {
            //console.log("apply");
            // Let us extract the value from the textbox now 
        },
        
        selectDisplay: function () {
            console.log("select");
            // Let us extract the value from the textbox now 
        },
        
        renderFile: function () {
            console.log("render");
            // Let us extract the value from the textbox now 
        },
        
        regions : {},

        ui : {},

        onRender : function () {
            function update(activeAnchor) {
                var group = activeAnchor.getParent();

                var topLeft = group.find('.topLeft')[0],
                    topCenter = group.find('.topCenter')[0],
                    topRight = group.find('.topRight')[0],
                    middleRight = group.find('.middleRight')[0],
                    bottomRight = group.find('.bottomRight')[0],
                    bottomCenter = group.find('.bottomCenter')[0],
                    bottomLeft = group.find('.bottomLeft')[0],
                    middleLeft = group.find('.middleLeft')[0],
                    image = group.find('.image')[0];

                var anchorX = activeAnchor.x(),
                    anchorY = activeAnchor.y();

                // update anchor positions
                switch (activeAnchor.name()) {
                    case 'topLeft':
                        topRight.y(anchorY);
                        
                        topCenter.y(anchorY);
                        topCenter.x((topLeft.x() + topRight.x())/2);
                        
                        bottomLeft.x(anchorX);
                        
                        middleLeft.x(anchorX);
                        middleLeft.y((topLeft.y() + bottomLeft.y())/2);
                        
                        middleRight.y((topRight.y() + bottomRight.y())/2);
                        
                        bottomCenter.x((bottomLeft.x() + bottomRight.x())/2);
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
                        topCenter.x((topLeft.x() + topRight.x())/2);
                        
                        bottomRight.x(anchorX);
                        
                        middleRight.x(anchorX);
                        middleRight.y((topLeft.y() + bottomRight.y())/2);
                        
                        bottomCenter.x((bottomLeft.x() + bottomRight.x())/2);
                        
                        middleLeft.y((topLeft.y() + bottomLeft.y())/2);
                        break;
                        
                    case 'middleRight':
                        topRight.x(anchorX);
                        
                        bottomRight.x(anchorX);

                        topCenter.x((topLeft.x() + topRight.x())/2);
                        
                        bottomCenter.x((bottomLeft.x() + bottomRight.x())/2);
                        break;
                        
                    case 'bottomRight':
                        topCenter.x((topLeft.x() + topRight.x())/2);
                        
                        bottomLeft.y(anchorY);
                        
                        middleLeft.y((topLeft.y() + bottomLeft.y())/2);
                        
                        bottomCenter.y(anchorY);
                        bottomCenter.x((bottomLeft.x() + bottomRight.x())/2);
                        
                        topRight.x(anchorX); 
                        
                        middleRight.x(anchorX);
                        middleRight.y((topRight.y() + bottomRight.y())/2);
                        break;
                        
                    case 'bottomCenter':
                        bottomRight.y(anchorY);
                        
                        bottomLeft.y(anchorY);

                        middleLeft.y((topLeft.y() + bottomLeft.y())/2);
                        
                        middleRight.y((topRight.y() + bottomRight.y())/2);
                        break;    
                        
                    case 'bottomLeft':
                        bottomRight.y(anchorY);
                        topLeft.x(anchorX);
                        
                        middleLeft.x(anchorX);
                        middleLeft.y((topLeft.y() + bottomLeft.y())/2);
                        
                        bottomCenter.y(anchorY);
                        bottomCenter.x((bottomLeft.x() + bottomRight.x())/2);
                        
                        middleRight.y((topRight.y() + bottomRight.y())/2);
                        
                        topCenter.x((topLeft.x() + topRight.x())/2);
                        break;
                        
                    case 'middleLeft':
                        topLeft.x(anchorX);
                        
                        bottomLeft.x(anchorX);

                        topCenter.x((topLeft.x() + topRight.x())/2);
                        
                        bottomCenter.x((bottomLeft.x() + bottomRight.x())/2);
                        break;
                }

                image.setPosition(topLeft.getPosition());

                var width = topRight.x() - topLeft.x();
                var height = bottomLeft.y() - topLeft.y();
                if(width && height) {
                    image.setSize({width:width, height: height});
                    
                    App.vent.trigger("showCurrentLayerSize", {
                        "currentLayerWidth": width,
                        "currentLayerHeight" : height
                    });
                }
            }
            
            var l = 10;
            
            function addAnchor(group, x, y, name) {
                var stage = group.getStage();
                var layer = group.getLayer();

                var anchor = new Kinetic.Rect({
                    x: x - l/2,
                    y: y - l/2,
                    width: l,
                    height: l,
                    stroke: '#000',
                    fill: '',
                    name: name,
                    draggable: true,
                    dragOnTop: false
                });

                anchor.on('dragmove', function() {
                    update(this);
                    layer.draw();
                });
                anchor.on('mousedown touchstart', function() {
                    group.setDraggable(false);
                    this.moveToTop();
                });
                anchor.on('dragend', function() {
                    group.setDraggable(true);
                    layer.draw();
                });
                
                // add hover styling
                anchor.on('mouseover', function() {
                    var layer = this.getLayer();
                    
                    if (anchor.name() === 'topCenter' || anchor.name() === 'bottomCenter') {
                        document.body.style.cursor = 'ns-resize';
                    }
                    else if (anchor.name() === 'middleLeft' || anchor.name() === 'middleRight') {
                        document.body.style.cursor = 'ew-resize';
                    }
                    else if (anchor.name() === 'topLeft' || anchor.name() === 'bottomRight') {
                        document.body.style.cursor = 'nwse-resize';
                    }
                    else if (anchor.name() === 'topRight' || anchor.name() === 'bottomLeft') {
                        document.body.style.cursor = 'nesw-resize';
                    }
                    this.setStrokeWidth(4);
                    layer.draw();
                });
                anchor.on('mouseout', function() {
                    var layer = this.getLayer();
                    document.body.style.cursor = 'default';
                    this.strokeWidth(2);
                    layer.draw();
                });
                
                // set anchors topCenter and bottomCenter to move only on vertical
                if (anchor.name() === 'topCenter' || anchor.name() === 'bottomCenter') {
                    anchor.dragBoundFunc(function(pos) {
                        return {
                            x: this.getAbsolutePosition().x,
                            y: pos.y
                        }
                    }); 
                }
                
                // set anchors middleLeft and middleRight to move only on horizontal
                if (anchor.name() === 'middleLeft' || anchor.name() === 'middleRight') {
                    anchor.dragBoundFunc(function(pos) {
                        return {
                            x: pos.x,
                            y: this.getAbsolutePosition().y
                        }
                    }); 
                }
                
                group.add(anchor);
            }
            
            function loadImages(sources, callback) {
                console.log(sources);
                var images = {};
                var loadedImages = 0;
                var numImages = 0;
                
                _.each(sources, function( val, key ) {
                    if (val) {
                        numImages++;
                    }
                });
                //console.log("here1");
            
                _.each(sources, function( val, key ) {
                    if (val) {
                        console.log(key);
                        var id = key;
                        
                        images[id] = new Image();
                        images[id].onload = function() {
                            if(++loadedImages >= numImages) {
                                callback(images);
                            }
                            // send initial width and size
                            App.vent.trigger("showInitialLayerSize", {
                                "initialLayerWidth": this.width,
                                "initialLayerHeight" : this.height
                            });
                        };
                        images[id].src = val["path"];
                    }
                });
            }
            
            function initStage(images) {
                console.log(images);
                
                var stage = new Kinetic.Stage({
                    container: 'container',
                    width: images[0].width,
                    height: images[0].height
                });
                
                
                var layer = new Kinetic.Layer();
                
                var bg = new Kinetic.Rect({
                    width: stage.getWidth(),
                    height: stage.getHeight(),
                    fill : 'grey',
                    x: 0,
                    y: 0
                });

                layer.add(bg);
                stage.add(layer);
                
                // 
                _.each(images, function( val, key ) {
                    if (val) {
                        console.log(key);
                        
                        var group = new Kinetic.Group({
                            x: 0,
                            y: 0,
                            draggable: true
                        });
                        
                        var layer = new Kinetic.Layer();
                        
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
                        addAnchor(group, img.getWidth()/2, 0, 'topCenter');
                        addAnchor(group, img.getWidth(), 0, 'topRight');
                        addAnchor(group, img.getWidth(), img.getHeight()/2, 'middleRight');  
                        addAnchor(group, img.getWidth(), img.getHeight(), 'bottomRight');
                        addAnchor(group, img.getWidth()/2, img.getHeight(), 'bottomCenter');
                        addAnchor(group, 0, img.getHeight(), 'bottomLeft');
                        addAnchor(group, 0, img.getHeight()/2, 'middleLeft');

                        group.on('dragstart', function() {
                            this.moveToTop();
                        });
                        
                    }
                });

                stage.draw();
            }
            
            loadImages(this.sources, initStage);
        }
    });
});