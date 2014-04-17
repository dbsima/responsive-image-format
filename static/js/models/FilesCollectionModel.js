define(["jquery", "backbone"],
       function ($, Backbone) {
        "use strict";
        return Backbone.Collection.extend({
            model: File,
            urlRoot: '/files'
        });
    });