/*global define*/

define(['marionette', 'vent', 'templates'], function (Marionette, vent, templates) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.uploadFile,
        tagName: 'div'
    });
});