define(['marionette', 'vent', 'templates'],
       function (Marionette, vent, templates) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.editFile,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                operations  : '#operations',
                image       : '#image',
                layers      : '#layers'
            },

            ui : {},

            events : {},

            initialize : function (options) {
                this.options = options;
                console.log("here in editFileView I have " + this.options);
            },

            onRender : function () {
                //this.sidebar.show(new Sidebar({ groups : this.options.groups }));
                this.operations.show(this.options.operations);
                this.image.show(this.options.image);
                this.layers.show(this.options.layers);
            },
            
            onShow: function () {
                //this.filesCollection.show(this.options);
            }
        });
    });
