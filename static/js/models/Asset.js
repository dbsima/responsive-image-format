define(["jquery", "backbone"],
       function ($, Backbone) {
        "use strict";
        return Backbone.Model.extend({
            initialize: function (options) {
                //console.log(options);
            },
            
            defaults: {
                id: "",
                layers: {}
            },
            
            url: function () {
                var path = this.get("path");
                //console.log(path);
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