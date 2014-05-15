define(['marionette', 'templates', 'models/User'],
    function (Marionette, templates, UserModel) {
        "use strict";

        return Marionette.ItemView.extend({
            template : templates.header,
            
            initialize: function (options) {
                
                options = options || {};
                if (options.tab && options.model) {
                    options.model.set('tab', options.tab);
                }

            },
            updateTab: function (option) {
            }
        });
    });
