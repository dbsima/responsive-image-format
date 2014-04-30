define(['app',
        'vent',
        'models/FilesCollection',
        'views/FilesCollection',
        'views/Body',
        'views/Header',
        'views/Footer',
        'views/UploadFile',
        'views/EditFile',
        'views/Operations',
        'views/Image',
        'views/Layers',
        'models/File',
        'models/Layer'
       ],
       function (app, vent, FilesCollectionModel, FilesCollectionView, BodyView, Header, Footer, UploadFile, EditFileView, OperationsView, ImageView, LayersView, FileModel, LayerModel) {
        "use strict";

        return {
            initialize: function (options) {
                this.options = options;
            },

            listFiles: function () {
                app.header.show(new Header(app.options));

                this.collection = new FilesCollectionModel();
                
                var self = this;
                this.collection.fetch({
                    success: function (files) {
                        var filesView = new FilesCollectionView({ collection: self.collection });

                        app.body.show(new BodyView({uploadFile: new UploadFile(), filesView: filesView}));
                    }
                });
                app.footer.show(new Footer(app.options));
            },

            editFile: function (path) {
                //console.log("path in controller" + path);
                app.header.show(new Header(app.options));

                this.model = new FileModel({path: path});
                var layerModel = new LayerModel();
                var self = this;
                this.model.fetch({
                    success: function (file) {
                        //var fileMOdelTest = this.fileModel;
                        app.body.show(new EditFileView({operations: new OperationsView({model: layerModel}), image: new ImageView({model: self.model, path: path}), layers: new LayersView()}));
                    }
                });

                app.footer.show(new Footer(app.options));
            },
            
            selectDisplay: function (path) {
            },
            
            renderAsset: function (path) {
            }
            
            
        };
    });
