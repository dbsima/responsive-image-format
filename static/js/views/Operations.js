/*global define*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'bootstrap', 'models/Layer', 'select'], function ($, App, Marionette, vent, templates, bootstrap, LayerModel, Select) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.operations,

        tagName: 'div',

        events : {
            'click #btnHideLayer' : 'hideLayer',
            'click #btnDeleteLayer' : 'deleteLayer',
            'click #openSmartShape': 'initSmartShape'
        },

        initialize: function (options) {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(App.vent, "showInitialLayerSize", this.onLayerInit);
            this.listenTo(App.vent, "showCurrentLayerSize", this.onLayerSizeChange);
            this.asset_id = options.asset_id;
            this.isShapeOpen = false;

            $(window).on('load', function () {
                console.log("windoew");
                $('.selectpicker').selectpicker({
                    'selectedText': 'cat'
                });
            });
            $('.selectpicker').selectpicker({
                'selectedText': 'cat'
            });
        },

        hideLayer : function () {
            var layer_id = document.getElementById('btnHideLayer').getAttribute('data-id');
            console.log("hide layer" + layer_id);
        },

        initSmartShape : function () {
            //console.log("here");
            //var layer_id = document.getElementById('btnHideLayer').getAttribute('data-id');

            var form_data = new FormData();
            form_data.append("asset_id", this.asset_id);
            form_data.append("smart_layer", 'cacamaca');
            var self = this;
            $.ajax({
                async: false,
                url: "/layers",
                dataType: 'text',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,
                type: 'post',
                success: function (response) {
                    console.log("success POST on /layers");
                    // success adding smart layer =>

                },
                error: function (response) {
                    console.log("error POST on /layers");
                    //console.log(response);
                }
            });
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
                    App.vent.trigger("afterLayerDeleted", {"layer": "deleted"});
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
            //console.log(options);
            //console.log(options);
            if (options.current_width && options.current_height && options.current_layer) {
                //console.log(options.currentLayerWidth + " - " + options.currentLayerHeight);
                this.model.set('current_width', options.current_width);
                this.model.set('current_height', options.current_height);
                this.model.set('current_layer', options.current_layer);
                this.model.set('current_asset', options.current_asset);
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