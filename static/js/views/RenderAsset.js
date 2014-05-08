define(['marionette', 'vent', 'templates'],
       function (Marionette, vent, templates) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.renderAsset,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                devices : '#devices',
                display  : '#display'
            },

            ui : {},

            events : {},

            initialize : function (options) {
                this.options = options;
                //console.log("here in editFileView I have " + this.options);
            },

            onRender : function () {
                this.devices.show(this.options.devices);
                this.display.show(this.options.display);
            },
            
            onShow: function () {
                //this.filesCollection.show(this.options);
            }
        });
    });
