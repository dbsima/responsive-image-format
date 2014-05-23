define(['marionette', 'vent', 'templates'],
       function (Marionette, vent, templates) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.selectDevice,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                devices : '#devices',
                device  : '#device'
            },

            initialize : function (options) {
                this.options = options;
                //console.log("here in editFileView I have " + this.options);
            },

            onRender : function () {
                this.devices.show(this.options.devices);
                this.device.show(this.options.device);
            }
        });
    });
