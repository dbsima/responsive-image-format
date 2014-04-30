define(['marionette'], function (Marionette) {
    'use strict';

    return Marionette.AppRouter.extend({
        
        appRoutes: {
            'explore'       : 'listFiles',
            'edit'          : 'editFile',
            'edit/*path'    : 'editFile',
            'select/*path'  : 'selectDisplay',
            'render/*path'  : 'renderAsset'
        }
    });
});
