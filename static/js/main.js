require.config({

    paths : {
        underscore  :   'lib/underscore',
        backbone    :   'lib/backbone',
        marionette  :   'lib/backbone.marionette',
        jquery      :   'lib/jquery.min',
        bootstrap   :   'lib/bootstrap.min',
        tpl         :   'lib/tpl',
        prettify    :   'lib/prettify.min',
        wreqr       :   'lib/backbone.wreqr',
        kinetic     :   'lib/kinetic-v5.1.0',
        cookie      :   'lib/jquery.cookie',
        modernizr   :   'lib/modernizr.custom',
        morphingdevice: 'lib/morphingdevice'
    },

    shim : {
        'lib/backbone-localStorage' : ['backbone'],
        'lib/bootstrap-contextmenu' : ['bootstrap'],
        'lib/bootstrap-typeahead'   : ['bootstrap'],
        underscore : {
            exports : '_'
        },
        backbone : {
            exports : 'Backbone',
            deps : ['jquery', 'underscore']
        },
        marionette : {
            exports : 'Backbone.Marionette',
            deps : ['backbone']
        },
        wreqr : {
            exports : 'Backbone.Wreqr',
            deps : ['backbone']
        },
        prettify: {
            deps : ['jquery', 'bootstrap']
        }
    },

    deps : ['jquery', 'underscore']
});

require(['app', 'backbone', 'routers/index', 'controllers/index'],
    function (app, Backbone, Router, Controller) {
        "use strict";
        app.start();

        app.router = new Router({
            controller : Controller
        });

        Backbone.history.start({pushState: true });
    });
