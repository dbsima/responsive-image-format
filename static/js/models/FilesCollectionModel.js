define(["jquery", "backbone", "models/File"],
       function ($, Backbone, FileModel) {
        "use strict";
        return Backbone.Collection.extend({
            model: FileModel,
            urlRoot: '/files'
        });
    });