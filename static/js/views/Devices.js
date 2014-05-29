/*global define*/

define(['jquery', 'app', 'marionette', 'vent', 'templates', 'bootstrap'], function ($, App, Marionette, vent, templates, bootstrap) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.devices,

        initialize: function () {
            //_.bind(this, this.onRender);
            //this.on("change", _.bind(this.onModelChanged, this));
            _.bind(this.onSelectDevice, this);
            //this.listenTo(this.model, "change", this.render);
            this.listenTo(App.vent, "showDevices", this.onShowDevices);
            //console.log("here2");
        },

        events : {
            'click div.product-chooser-item' : 'onSelectDevice'
        },

        onSelectDevice : function (event) {
            //console.log(event.currentTarget.id);
            if ($(event.currentTarget).parent().parent().parent().not('.disabled')) {
                //console.log(event.currentTarget.id);
                $(event.currentTarget).parent().parent().parent().find('div.product-chooser-item').removeClass('selected');
                $(event.currentTarget).addClass('selected');
                $(event.currentTarget).find('input[type="radio"]').prop("checked", true);

                App.vent.trigger("changeDisplayInRenderer", {device: event.currentTarget.id});
            }
        }
    });
});