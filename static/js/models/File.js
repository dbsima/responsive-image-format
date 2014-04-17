define(["jquery", "backbone"],
       function ($, Backbone) {
        "use strict";
        return Backbone.Model.extend({
            defaults: {
                filename: "",
                user_email: ""
            },
            urlRoot: '/files'
        });
    });