/*global define*/

define(['marionette', 'vent', 'templates', 'views/Asset'], function (Marionette, vent, templates, AssetView) {
    "use strict";

    return Marionette.CollectionView.extend({
        itemView: AssetView,
        tagName: 'div',
        tagClass: 'row'

    });
});