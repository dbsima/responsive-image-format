/*global define*/

define(['jquery', 'jqueryUI', 'app', 'marionette', 'vent', 'templates', 'kinetic', 'models/Layer'], function ($, jqueryUI, App, Marionette, vent, templates, Kinetic, LayerModel) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.display,

        tagName: 'div',

        initialize: function () {

            this.asset = this.model.toJSON();

            this.sources = {};
            this.sources['0'] = {id: '0', path: "../files/" + this.model.toJSON().resolutions + ".png", timestamp: this.model.toJSON()['timestamp']};
            console.log(this.asset.id);


            this.versions = {};
            var self = this;
            $.ajax({
                async: false,
                type: "GET",
                url: "/versionsOfAsset/" + self.asset.id,
                dataType: 'json',
                success: function (versions) {
                    console.log("success GET on /versionsOfAsset/assetId");
                    //console.log(layers);
                    var i;
                    for (i = 0; i < versions.length; i = i + 1) {
                        console.log("versions id " + versions[i].id + versions[i].type);
                        this.versions[i] = {
                            id: String(versions[i].id),
                            display_w: versions[i].display_width,
                            display_h: versions[i].display_height,
                            version_w: versions[i].width,
                            version_h: versions[i].height,
                            path: "../files/" + versions[i].id + versions[i].type
                        };
                    }
                }.bind(this),
                error: function (response) {
                    console.log("error GET on /layers with asset_id in json");
                }
            });
            this.model.set('versions', this.versions);
        },

        changings: function () {
            console.log("change");
        },

        onShow: function () {

            var self = this;
            console.log(self.versions[0].version_w + "-" + self.versions[0].version_h);
            console.log(self.versions);
            this.$('#resizable').resizable({
                alsoResize:  '#resizable .md-device .display',
                minHeight: self.versions[0].version_h,
                minWidth: self.versions[0].version_w,
                aspectRatio: true
            });
            //console.log("here");
        },

        onRender: function () {
            //
        }
    });
});