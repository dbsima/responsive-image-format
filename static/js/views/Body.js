define(['marionette', 'vent', 'templates', 'views/UploadFile', 'views/File', 'views/FilesCollection'],
       function (Marionette, vent, templates, UploadFile, File, FilesCollection) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.body,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                uploadFile      : '#uploadFile',
                filesCollection : '#filesCollection',
                breadcrumbs     : '#breadcrumbs'
            },

            ui : {},

            events : {},

            initialize : function (options) {
                this.options = options;
                console.log("here in body I have " + this.options);
            },

            onRender : function () {
                //this.sidebar.show(new Sidebar({ groups : this.options.groups }));
                this.uploadFile.show(this.options.uploadFile);
                this.filesCollection.show(this.options.filesView);
            },
            
            onShow: function() {
                //this.filesCollection.show(this.options);
            }
        });
    });
