define(['marionette', 'backbone', 'templates', 'vent', 'views/Header', 'views/Body', 'views/Footer'],
       function (Marionette, Backbone, templates, vent, Header, Body, Footer) {
        "use strict";

        window.app = new Marionette.Application();

        app.options = {region: '#body'};

        app.addRegions({
            header : '#header',
            body   : '#body',
            sidebar: '#sidebar',
            main   : '#main',
            footer : '#footer'
        });

        app.addInitializer(function () {
        });

        //console.log("testing from app.js");

        return app;
    });