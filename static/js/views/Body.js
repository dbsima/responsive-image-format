define(['marionette', 'vent', 'templates', 'views/UploadFile', 'views/SearchPanel', 'views/AssetsCollection'],
       function (Marionette, vent, templates, UploadFile, AssetsCollection) {
        "use strict";

        return Marionette.Layout.extend({

            template : templates.body,

            tagName: 'div',

            className: 'row-fluid',

            regions : {
                searchPanel     : '#searchPanel',
                uploadFile      : '#uploadFile',
                //filesCollection : '#filesCollection'
                assetsCollection : '#assetsCollection'
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
                this.assetsCollection.show(this.options.assetsView);
            },
            
            onShow: function () {
                //this.filesCollection.show(this.options);
            }
        });
    });
