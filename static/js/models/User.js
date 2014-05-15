define(["jquery", "backbone", "cookie"],
       function ($, Backbone, Cookie) {
        "use strict";
        return Backbone.Model.extend({
            // Model Constructor
            /*
            initialize: function () {
                this.set("email", $.cookie("email"));
                //this.on("change", _.bind(this.onModelChanged, this));

                //this.checkIsUserSignedIn();
            },*/
            initialize: function (options) {
                //console.log(options);
            },
            // Default values for all of the Model attributes
            defaults: {
                email: "",
                isSignedIn: false,
                tab: ""
            }
        });
    });