define(['marionette', 'vent', 'templates', 'views/UploadFile', 'views/File', 'views/FilesCollection', 'views/SearchPanel'],
       function (Marionette, vent, templates, UploadFile, File, FilesCollection) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.body,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                searchPanel     : '#searchPanel',
                uploadFile      : '#uploadFile',
                filesCollection : '#filesCollection'
            },

            ui : {},

            events : {},

            initialize : function (options) {
                this.options = options;
                console.log("here in body I have " + this.options);
            },

            onRender : function () {
                this.searchPanel.show(this.options.searchPanel);
                this.uploadFile.show(this.options.uploadFile);
                this.filesCollection.show(this.options.filesView);
            },
            
            onShow: function() {
                //this.filesCollection.show(this.options);
            }
        });
    });
