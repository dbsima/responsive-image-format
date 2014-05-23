/*global define*/

define(['app', 'marionette', 'vent', 'templates', 'bootstrap', 'models/Layer'], function (App, Marionette, vent, templates, bootstrap, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.operations,

        tagName: 'div',

        events : {
            'click #btnHideLayer' : 'hideLayer',
            'click #btnDeleteLayer' : 'deleteLayer',
            'click #openSmartShape': 'initSmartShape'
        },

        initialize: function () {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(App.vent, "showInitialLayerSize", this.onLayerInit);
            this.listenTo(App.vent, "showCurrentLayerSize", this.onLayerSizeChange);

            this.is_shape_open = false;
        },

        hideLayer : function () {
            var layer_id = document.getElementById('btnHideLayer').getAttribute('data-id');
            console.log("hide layer" + layer_id);
        },

        initSmartShape : function () {
            //var layer_id = document.getElementById('btnHideLayer').getAttribute('data-id');
            if (!this.is_shape_open) {
                this.is_shape_open = true;
                console.log("initSmartShape");



            } else {
                this.opened_shape = false;
            }


        },

        deleteLayer : function () {
            var layerModel = new LayerModel({path: this.model.get('current_layer')});

            console.log("delete layer " + this.model.get('current_layer'));
            console.log("delete asset " + this.model.get('current_asset'));
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
            console.log(options);
            //console.log(options);
            if (options.current_width && options.current_height && options.current_layer) {
                //console.log(options.currentLayerWidth + " - " + options.currentLayerHeight);
                this.model.set('current_width', options.current_width);
                this.model.set('current_height', options.current_height);
                this.model.set('current_layer', options.current_layer);
                this.model.set('current_asset', options.current_asset);
            }
        }
    });
});