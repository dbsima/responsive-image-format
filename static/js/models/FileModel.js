define(["jquery", "backbone"],
       function ($, Backbone) {
        "use strict";
        return Backbone.Model.extend({
            defaults: {
                fileName: "",
                user: ""
            },
            urlRoot: '/files'
        });
    });