/*global define*/

define(['jquery', 'marionette', 'backbone', 'vent', 'templates'], function ($, Marionette, Backbone, vent, templates) {
    "use strict";

    return Marionette.ItemView.extend({
        template : templates.asset,

        tagName: 'li',

        events : {
            'click #btnEditFile' : 'editFile',
            'click #btnDeleteFile' : 'deleteFile'
        },

        editFile: function () {
            var asset_id = document.getElementById('btnEditFile').getAttribute('data-id');
            console.log("editFile " + asset_id);
        },

        deleteFile: function () {
            var asset_id = document.getElementById('btnDeleteFile').getAttribute('data-id');
            console.log("deleteFile " + asset_id);

            $.ajax({
                async: false,
                type: "DELETE",
                url: "/assets/" + asset_id,
                dataType: "text",
                success: function (response) {
                    console.log("success DELETE on /assets/:imgID");
                    console.log(response);
                },
                error: function (response) {
                    console.log("error DELETE on /assets/:imgID");
                    console.log(response);
                }
            });

            // Remove model from collection
            // (TODO: it's a hack; if the model has more than one collection it wont work)
            this.model.collection.remove(this.model);
        }
    });
});