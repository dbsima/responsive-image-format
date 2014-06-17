define(["jquery", "backbone"],
       function ($, Backbone) {
        "use strict";
        return Backbone.Model.extend({
            initialize: function (options) {
                //console.log(options);
            },

            defaults: {
                id: "",
                time_stamp: "",
                resolutions: "",
                ext: "",
                change: "",
                shared: "",
                user_id: "",
                device: "md-device-1",
                display_w: "1920",
                display_h: "1080",
                size: "",

                desktop_w: "1920",
                desktop_h: "1080",
                laptop_w: "1680",
                laptop_h: "1050",
                tablet_w: "1136",
                tablet_h: "768",
                phone_w: "1024",
                phone_h: "640",

                versions: "",
                active_v: ""
            },

            url: function () {
                var path = this.get("path");
                return "/assets/" + path;
            },

            toJSON: function (options) {
                var result = Backbone.Model.prototype.toJSON.apply(this, arguments);
                result.filters = this.get("filters") ? this.get("filters").toJSON(options) : {};
                var currentDefaults = this.defaults;

                options = options || {};
                if (options.override) {
                    _.each(options.override, function (value, key) {
                        if (result.hasOwnProperty(key)) {
                            result[key] = value;
                        }
                    });
                }
                if (options.removeDefaultValues) {
                    var filteredResult = {};
                    _.each(result, function(value, key){
                        if (value != currentDefaults[key]){
                            filteredResult[key] = value;
                        }
                    });
                    result = filteredResult;
                }
                return result;
            }
        });
    });