define(["jquery", "backbone", "cookie"],
       function ($, Backbone, Cookie) {
        "use strict";
        return Backbone.Model.extend({
            initialize: function () {
                this.set("email", $.cookie("nrif.email"));
                this.on("change", _.bind(this.onModelChanged, this));

                this.checkIsUserSignedIn();
            },
            // Default values for all of the Model attributes
            defaults: {
                email: "",
                isSignedIn: false,
                tab: ""
            },

            signIn: function(credentials){
                //credentials = {"email": .., "password": ...}

                var request = jQuery.post( "/api/v1/users/signin", credentials);

                request.done(
                    _.bind(function(data) {
                        this.set({
                            "username": credentials.email,
                            "isSignedIn": true});
                    }, this));

                request.fail(function(data){
                    console.log(data.responseText);

                    App.vent.trigger("signInFailed", credentials);
                });
            },

            signOut: function(){
                var request = jQuery.ajax({
                    url: '/api/v1/users/signout',
                    type: 'GET',
                    async: false,
                    success: jQuery.proxy(function(result) {
                        this.set("isSignedIn", false);
                    }, this)
                });
            },

            checkIsUserSignedIn: function(){
                if (!$.cookie("nrif.email")){
                    return;
                }

                jQuery.ajax({
                    url: '/api/v1/users/current',
                    type: 'GET',
                    async: false,
                    success: jQuery.proxy(function(result) {
                        this.set({
                            "email": jQuery.cookie("nrif..email"),
                            "isSignedIn": true});
                    }, this)
                });
            },

            onModelChanged: function(){
                jQuery.cookie("nrif.email", this.get("email"));
                jQuery.cookie("nrif.is_signed_in", this.get("isSignedIn"));
            }
        });
    });