define(['app',
        'backbone',
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
        'models/Layer',
        'models/Asset'
       ],
       function (app, Backbone, vent, FilesCollectionModel, FilesCollectionView, BodyView, Header, Footer, UploadFile, EditFileView, OperationsView, ImageView, LayersView, FileModel, LayerModel, AssetModel) {
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
                
                //console.log("editFile " + path);

                
                var layerModel = new LayerModel();
                this.model = new AssetModel({path: path});
                
                var self = this;
                this.model.fetch({
                    success: function (asset) {
                        //console.log("layers -|" + self.model.get("id") + "|");
                        //var fileMOdelTest = this.fileModel;
                        app.body.show(new EditFileView({operations: new OperationsView({model: layerModel}), image: new ImageView({model: self.model, path: path}), layers: new LayersView()}));
                        
                        // redirect to /edit/asset_id
                        //Backbone.history.navigate("/edit/" + "dsadad", {"trigger": false});
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
