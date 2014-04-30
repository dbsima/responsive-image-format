define(["jquery", "backbone"],
       function ($, Backbone) {
        "use strict";
        return Backbone.Model.extend({
            initialize: function (options) {
                //console.log(options);
            },
            
            defaults: {
                initialWidth: "",
                initialHeight: "",
                currentWidth: "",
                currentHeight: ""
            }
        });
    });