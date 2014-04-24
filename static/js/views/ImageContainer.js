define(['marionette', 'vent', 'templates', 'kinetic'], function (Marionette, vent, templates, Kinetic) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.imageContainer,

        initialize: function (options) {
            this.options = options;
            console.log("adsada" + options.path);
            //this.listenTo(this.model, "change", this.render);   
        },
        
        events : {
            'click #btnGrayscaleImage' : 'grayscaleImage',
            'click #btnRotateImage' : 'rotateImage'
        },

        grayscaleImage: function () {
            console.log("grayscale");
            // Let us extract the value from the textbox now 
        },
        
        rotateImage: function () {
            console.log("rotate");
            // Let us extract the value from the textbox now 
        },
        
        regions : {},

        ui : {},

        onRender : function () {
            var imageObj = new Image();
            imageObj.onload = function () {
                var stage = new Kinetic.Stage({
                    container: 'container',
                    width: 578,
                    height: 300
                });
                var layer = new Kinetic.Layer(),
                    darth = new Kinetic.Image({
                        x: 10,
                        y: 10,
                        image: imageObj,
                        draggable: true,
                        blurRadius: 20
                    });

                layer.add(darth);
                stage.add(layer);

                darth.cache();
                darth.filters([Kinetic.Filters.Blur]);
                layer.draw();

                var slider = document.getElementById('slider');
                slider.onchange = function () {
                    darth.blurRadius(slider.value);
                    layer.batchDraw();
                };
                /*
                var sizeX = document.getElementById('sizeX');
                var sizeY = document.getElementById('sizeY');
                
                sizeX.onchange = function () {
                    console.log(sizeX.value +','+ sizeY.value);
                    darth.scale({x: sizeX.value, y: sizeY.value});
                    layer.batchDraw();
                };
                sizeY.onchange = function () {
                    console.log(sizeX.value +','+ sizeY.value);
                    darth.scale({x: sizeX.value, y: sizeY.value});
                };*/
                
                var btnGrayscaleImage = document.getElementById('btnGrayscaleImage');
                btnGrayscaleImage.onclick = function () {
                    console.log("grayscale");
                    darth.filters([Kinetic.Filters.Grayscale]);
                    layer.draw();
                };
            };
            imageObj.src = "../uploads/" + this.options.path;
        }
    });
});