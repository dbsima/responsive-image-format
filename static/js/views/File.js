/*global define*/

define(['marionette', 'vent', 'templates'], function (Marionette, vent, templates) {
    "use strict";

    return Marionette.ItemView.extend({
        template : templates.file,
        
        tagName: 'div',

        events : {
            'click #btnEditFile' : 'editFile',
            'click #btnDeleteFile' : 'deleteFile'
        },

        editFile: function () {
            // Let us extract the value from the textbox now 
        },
        
        deleteFile: function () {
            // Let us extract the value from the textbox now 
        }
    });
});