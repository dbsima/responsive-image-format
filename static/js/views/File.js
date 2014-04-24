/*global define*/

define(['marionette', 'vent', 'templates'], function (Marionette, vent, templates) {
    "use strict";

    return Marionette.ItemView.extend({
        template : templates.file,
        
        tagName: 'li',
        
        initialize: function () {
            console.log("file item view");
            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        events : {
            'click #btnEditFile' : 'editFile',
            'click #btnDeleteFile' : 'deleteFile'
        },

        editFile: function () {
            // Let us extract the value from the textbox now 
        },
        
        deleteFile: function () {
            // 
            this.model.destroy();
        }
    });
});