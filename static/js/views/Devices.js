/*global define*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'bootstrap'], function ($, App, Marionette, vent, templates, bootstrap) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.devices,

        events : {
        },

        regions : {},

        ui : {},

        initialize: function () {
            //this.listenTo(this.model, "change", this.render);
            this.listenTo(App.vent, "showDevices", this.onShowDevices);
            console.log("here2");
        },
        
        onShowDevices : function () {
            
        },

        onRender : function () {
            
        }
    });
});