/*global define*/

define(['app', 'marionette', 'vent', 'templates', 'bootstrap', 'modernizr'], function (App, Marionette, vent, templates, bootstrap, modernizr) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.device,
        
        tagName: 'div',

        events : {
        },

        regions : {},

        ui : {},

        initialize: function () {
            //this.listenTo(this.model, "change", this.render);
            //this.listenTo(App.vent, "showInitialLayerSize", this.onLayerInit);
            //this.listenTo(App.vent, "showCurrentLayerSize", this.onLayerSizeChange);
        },

        onRender: function () {
            console.log("here0");
            App.vent.trigger("showDevices", {});
            console.log("here1");
        }
    });
});