/*global define*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'bootstrap', 'models/Layer', 'select', 'slider'], function ($, App, Marionette, vent, templates, bootstrap, LayerModel, Select, Slider) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.operations,

        tagName: 'div',

        events : {
            'click #btnHideLayer' : 'hideLayer',
            'click #btnDeleteLayer' : 'deleteLayer',
            'click #openSmartShape': 'initSmartShape',
            'change #chooseShape': 'changeShape',
            'change #chooseGradient': 'changeGradient',
            'change #chooseBlending': 'changeBlending',
            'change #chooseOpacity': 'changeOpacity'
        },

        initialize: function (options) {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(App.vent, "showInitialLayerSize", this.onLayerInit);
            this.listenTo(App.vent, "showCurrentLayerSize", this.onLayerSizeChange);
            this.asset_id = options.asset_id;
            this.isShapeOpen = false;

            console.log(this.model);

            $(window).on('load', function () {
                console.log("windoew");
                $('.selectpicker').selectpicker({
                    'selectedText': 'cat'
                });
            });
            $('.selectpicker').selectpicker({
                'selectedText': 'cat'
            });

            $('#ex1').slider({
                formater: function(value) {
                    return 'Current value: ' + value;
                }
            });
        },

        changeShape: function (options) {
            console.log("change shape");

            var elt = document.getElementById('chooseShape');
            if (elt.selectedIndex != -1) {
                //console.log(elt.options[elt.selectedIndex].value);
                //this.model.set('shape', elt.options[elt.selectedIndex].value);
                this.selectedShape = elt.options[elt.selectedIndex].value;
                var self = this;
                console.log(self);
                $.ajax({
                    url: "/layers/" + self.model.get('current_layer'),
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"shape": self.selectedShape}),
                    type: 'PATCH',
                    success: function (response) {
                        console.log("success PATCH on /layers");
                        App.vent.trigger("afterLayerChanged", {"shape": "changed"});
                    },
                    error: function (response) {
                        console.log("error PATCH on /layers");
                    }
                });
            }
        },

        changeOpacity: function (options) {
            console.log("change opacity");

            this.selectedOpacity = document.getElementById('chooseOpacity').value;
            console.log('opacity is ' + this.selectedOpacity/10);

            var self = this;
            //console.log(self);
            $.ajax({
                url: "/layers/" + self.model.get('current_layer'),
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"opacity": self.selectedOpacity/10}),
                type: 'PATCH',
                success: function (response) {
                    console.log("success PATCH on /layers");
                    App.vent.trigger("afterLayerChanged", {"opacity": "changed"});
                },
                error: function (response) {
                    console.log("error PATCH on /layers");
                }
            });
        },

        changeGradient: function (options) {
            console.log("change gradient");

            var elt = document.getElementById('chooseGradient');
            if (elt.selectedIndex != -1) {
                //this.model.set('gradient', elt.options[elt.selectedIndex].value);
                //console.log(elt.options[elt.selectedIndex].value);
                this.selectedGradient = elt.options[elt.selectedIndex].value;
                var self = this;
                $.ajax({
                    url: "/layers/" + self.model.get('current_layer'),
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"gradient": self.selectedGradient}),
                    type: 'PATCH',
                    success: function (response) {
                        console.log("success PATCH on /layers");
                        App.vent.trigger("afterLayerChanged", {"gradient": "changed"});
                    },
                    error: function (response) {
                        console.log("error PATCH on /layers");
                    }
                });
            }
        },

        changeBlending: function (options) {
            console.log("change blending");

            var elt = document.getElementById('chooseBlending');
            if (elt.selectedIndex != -1) {
                //this.model.set('blending', elt.options[elt.selectedIndex].value);
                //console.log(elt.options[elt.selectedIndex].value);
                this.selectedBlending = elt.options[elt.selectedIndex].value;
                var self = this;
                $.ajax({
                    url: "/layers/" + self.model.get('current_layer'),
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({"blending": self.selectedBlending}),
                    type: 'PATCH',
                    success: function (response) {
                        console.log("success PATCH on /layers");
                        App.vent.trigger("afterLayerChanged", {"blending": "changed"});
                    },
                    error: function (response) {
                        console.log("error PATCH on /layers");
                    }
                });
            }
        },

        hideLayer : function () {
            var layer_id = document.getElementById('btnHideLayer').getAttribute('data-id');
            console.log("hide layer" + layer_id);
        },

        deleteLayer : function () {
            var layerModel = new LayerModel({path: this.model.get('current_layer')});

            //console.log("delete layer " + this.model.get('current_layer'));
            // console.log("delete asset " + this.model.get('current_asset'));
            var self = this;
            $.ajax({
                async: false,
                url: "/layers/" + self.model.get('current_layer'),
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"asset_id": self.model.get("current_asset")}),
                type: 'DELETE',
                success: function (response) {
                    console.log("success POST on /layers");
                    console.log(response);
                    //console.log(response);
                    App.vent.trigger("afterLayerChanged", {"layer": "deleted"});
                },
                error: function (response) {
                    console.log("error POST on /layers");
                }
            });
        },

        onLayerInit: function (options) {
            options = options || {};
            //console.log(options);
            if (options.initial_width && options.initial_height) {
                //
                this.model.set('initial_width', options.initial_width);
                this.model.set('initial_height', options.initial_height);

                // the current size is equal with the initial size
                this.model.set('current_width', options.initial_width);
                this.model.set('current_height', options.initial_height);
            }
        },

        onLayerSizeChange: function (options) {
            options = options || {};
            this.options = options;
            //console.log(this.model);
            if (options.current_width && options.current_height && options.current_layer) {
                this.model.set('current_width', options.current_width);
                this.model.set('current_height', options.current_height);
                this.model.set('current_layer', options.current_layer);
                this.model.set('current_asset', options.current_asset);
                this.model.set('shape', options.shape);
                this.model.set('opacity', options.opacity);
                this.model.set('gradient', options.gradient);
                this.model.set('blending', options.blending);
                this.model.set('type', options.type);
            }
        },

        onShow: function (options) {
            console.log('here4');
            $('.selectpicker').selectpicker({
                'selectedText': 'cat'
            });
        }
    });
});