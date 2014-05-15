define(["jquery", "backbone", "models/Asset"],
       function ($, Backbone, AssetModel) {
        "use strict";
        return Backbone.Collection.extend({
            model: AssetModel,
            url: '/assets'
        });
    });