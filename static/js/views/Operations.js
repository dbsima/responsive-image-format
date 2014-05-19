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
            //console.log(options);
            if (options.initial_width && options.initial_height) {
                //console.log(options.initialLayerWidth + " - " + options.initialLayerHeight);
                this.model.set('initial_width', options.initial_width);
                this.model.set('initial_height', options.initial_height);
                
                // the current size is equal with the initial size
                this.model.set('current_width', options.current_width);
                this.model.set('current_height', options.current_height);
            }
        },
        
        onLayerSizeChange: function (options) {
            options = options || {};
            //console.log(options);
            if (options.current_width && options.current_height && options.current_layer) {
                //console.log(options.currentLayerWidth + " - " + options.currentLayerHeight);
                this.model.set('current_width', options.current_width);
                this.model.set('current_height', options.current_height);
                this.model.set('current_layer', options.current_layer);
            }
        }
    });
});