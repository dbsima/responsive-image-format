/*global define*/

define(['app', 'marionette', 'vent', 'templates', 'bootstrap'], function (App, Marionette, vent, templates, bootstrap) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.operations,
        
        tagName: 'div',

        events : {
            'click #btnUploadFile' : 'uploadFile'
        },

        uploadFile: function () {
            // Let us extract the value from the textbox now 
        },
        
        regions : {},

        ui : {},

        initialize: function () {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(App.vent, "showInitialLayerSize", this.onLayerInit);
            this.listenTo(App.vent, "showCurrentLayerSize", this.onLayerSizeChange);
        },

        onRender : function () {

        },
        
        onLayerInit: function (options) {
            options = options || {};
            if (options.initialLayerWidth && options.initialLayerHeight) {
                //console.log(options.initialLayerWidth + " - " + options.initialLayerHeight);
                this.model.set('initialWidth', options.initialLayerWidth);
                this.model.set('initialHeight', options.initialLayerHeight);
                
                // the current size is equal with the initial size
                this.model.set('currentWidth', options.initialLayerWidth);
                this.model.set('currentHeight', options.initialLayerHeight);
            }
        },
        
        onLayerSizeChange: function (options) {
            options = options || {};
            if (options.currentLayerWidth && options.currentLayerHeight) {
                //console.log(options.currentLayerWidth + " - " + options.currentLayerHeight);
                this.model.set('currentWidth', options.currentLayerWidth);
                this.model.set('currentHeight', options.currentLayerHeight);
            }
        }
    });
});