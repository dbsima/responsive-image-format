/*global define*/

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

        initialize: function () {

        },

        onRender : function () {

        }
    });
});