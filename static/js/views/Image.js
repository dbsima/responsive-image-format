/*global define*/
define(['marionette', 'vent', 'templates'],
       function (Marionette, vent, templates) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.image,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                imageOps : '#imageOps',
                imageContainer : '#imageContainer'
            },

            ui : {},

            events : {},

            initialize : function (options) {
                this.options = options;
                console.log("here in editFileView I have " + this.options);
            },

            onRender : function () {
                this.imageOps.show(this.options.imageOps);
                this.imageContainer.show(this.options.imageContainer);
            },
            
            onShow: function () {
                //this.filesCollection.show(this.options);
            }
        });
    });

define(['marionette', 'vent', 'templates'], function (Marionette, vent, templates) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.image,
        
        tagName: 'div',

        events : {
            'click #btnUploadFile' : 'uploadFile'
        },

        uploadFile: function () {
            // Let us extract the value from the textbox now 
        },
        
        regions : {},

        ui : {},

        initialize: function (options) {
            //console.log(options.model);
            this.listenTo(this.model, "change", this.render);
        },

        onRender : function () {

        }
    });
});