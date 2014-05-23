/*global define*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.display,

        tagName: 'div',

        initialize: function () {
            var asset = this.model.toJSON();

            this.sources = {};
            this.sources['0'] = {id: '0', path: "../files/" + this.model.toJSON().resolutions + ".png", timestamp: this.model.toJSON()['timestamp']};
            console.log(asset['id'] + ".png");

            //this.model.bind('change', this.onRender);
            this.listenTo(this.model, "change", this.changings);
        },

        changings: function () {
            console.log("change");
        },

        onRender: function () {
            console.log("onRender in Device");
            console.log(this.model.toJSON()['timestamp']);

            function loadImages(sources, callback) {
                console.log('load images');
                console.log(sources);
                var images = {};
                var loadedImages = 0;
                var numImages = 0;

                _.each(sources, function( val, key ) {
                    if (val) {
                        numImages++;
                    }
                });

                _.each(sources, function( val, key ) {
                    if (val) {
                        var id = key;

                        images[id] = new Image();
                        images[id].onload = function() {
                            if(++loadedImages >= numImages) {
                                callback(images);
                            }
                        };
                        images[id].src = val["path"] + "?"+(new Date()).getTime();
                    }
                });
            }

            function initStage(images) {
                console.log(images);

                var stage = new Kinetic.Stage({
                    container: 'container',
                    width: $('#container').width(),
                    height: $('#container').height()
                });

                // send initial width and size
                App.vent.trigger("showInitialLayerSize", {
                    "initialLayerWidth": stage.getWidth(),
                    "initialLayerHeight" : stage.getHeight()
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

                // For each layer create group and add anchors
                _.each(images, function( val, key ) {
                    if (val) {
                        //console.log(key);

                        var group = new Kinetic.Group({
                            x: 0,
                            y: 0
                        });

                        // update W & H in Operations -> Resize
                        group.on('click',function(){
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
                    }
                });
                stage.add(layer);
            }

            loadImages(this.sources, initStage);
        }
    });
});