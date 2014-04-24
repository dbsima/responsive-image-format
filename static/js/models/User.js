define(["jquery", "backbone"],
       function ($, Backbone) {
        "use strict";
        return Backbone.Model.extend({
            defaults: {
                email: "",
                password: ""
            },
            urlRoot: '/users'
        });
    });