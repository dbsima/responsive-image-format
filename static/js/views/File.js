/*global define*/

define(['jquery', 'marionette', 'backbone', 'vent', 'templates'], function ($, Marionette, Backbone, vent, templates) {
    "use strict";

    return Marionette.ItemView.extend({
        template : templates.file,
        
        tagName: 'li',
        
        initialize: function () {
            //console.log("file item view");
            //this.listenTo(this.model, "change", this.render);
            //this.listenTo(this.model, 'destroy', this.remove);
        },

        events : {
            'click #btnDeleteFile' : 'deleteFile'
        },
        
        deleteFile: function () {
            var imgID = $(event.target).data('id');
            console.log("deleteFile " + imgID);
            
            $.ajax({
                type: "DELETE",
                url: "/explore/" + imgID,
                dataType: "text",
                success: function (response) {
                    //Backbone.trigger("refresh");
                    console.log("success DELETE on /explore/:imgID");
                },
                error: function (response) {
                    console.log("error DELETE on /explore/:imgID");
                }
            });
            
            // Remove model from collection 
            // (TODO: it's a hack; if the model has more than one collection it wont work)
            this.model.collection.remove(this.model);
        }
    });
});