define(['marionette', 'vent', 'templates', 'views/Sidebar', 'views/UploadFile', 'views/File', 'views/FilesCollection'],
       function (Marionette, vent, templates, Sidebar, UploadFile, File, FilesCollection) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.body,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                sidebar : '#sidebar',
                header : '#header',
                main    : '#main',
                uploadFile : '#uploadFile',
                file: '#file',
                filesCollection: '#filesCollection',
                breadcrumbs: '#breadcrumbs'
            },

            ui : {},

            events : {},

            initialize : function () {

            },

            onRender : function () {
                this.sidebar.show(new Sidebar({ groups : this.options.groups }));
                this.uploadFile.show(new UploadFile());
                this.filesCollection.show(new FilesCollection());
            }
        });
    });
