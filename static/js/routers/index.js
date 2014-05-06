define(['marionette'], function (Marionette) {
    'use strict';

    return Marionette.AppRouter.extend({
        
        appRoutes: {
            ''              : 'index',
            'register'      : 'register',
            'login'         : 'login',
            'explore'       : 'listFiles',
            'edit'          : 'editFile',
            'edit/*path'    : 'editFile',
            'select'        : 'selectDevice',
            'select/*path'  : 'selectDevice',
            'render/*path'  : 'renderAsset'
        }
    });
});
