define(['marionette'], function (Marionette) {
  'use strict';

    return Marionette.AppRouter.extend({
        
        appRoutes: {
            'explore'                    : 'listFiles',
            //'edit'                       : 'editFile',
            /*'files'                      : 'listFiles',*/
            'groups/new'                 : 'groupNew',
            'groups/:id/groups/new'      : 'groupNew',
            'groups/create'              : 'groupCreate',
            'groups/:id/groups/create'   : 'groupCreate',
            'groups/:id'                 : 'groupShow',
            'groups/:id/edit'            : 'groupEdit',
            'groups/:id/update'          : 'groupUpdate',
            'groups/:id/delete'          : 'groupDelete',

            'groups/:id/users/:id' : 'groupUserShow',

            'groups/:id/categories/:id'            : 'groupCategoryShow',
            'groups/:id/users/:id/categories/:id'  : 'groupUserCategoryShow'
        }
    });
});
