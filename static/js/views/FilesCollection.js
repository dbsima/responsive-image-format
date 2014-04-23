/*global define*/

define(['marionette', 'vent', 'templates', 'views/file'], function (Marionette, vent, templates, FileView) {
    "use strict";

    return Marionette.CollectionView.extend({
        itemView: FileView,
        tagName: 'ul',
        initialize: function () {
            console.log("collection view");
        }
    });
});