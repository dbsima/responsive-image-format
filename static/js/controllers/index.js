define(['app',
        'backbone',
        'vent',
        'views/IndexHeader',
        'views/Login',
        'views/Register',
        'models/AssetsCollection',
        'views/AssetsCollection',
        'views/Body',
        'views/Header',
        'views/Footer',
        'views/UploadFile',
        'views/SearchPanel',
        'views/EditFile',
        'views/Operations',
        'views/Image',
        'views/Layers',
        'views/SelectDevice',
        'views/Devices',
        'views/Device',
        'views/RenderAsset',
        'views/Display',
        'models/User',
        'models/Layer',
        'models/Asset'
       ],
       function (app,
                  Backbone,
                  vent,
                  IndexHeaderView,
                  LoginView,
                  RegisterView,
                  AssetsCollectionModel,
                  AssetsCollectionView,
                  BodyView,
                  Header,
                  Footer,
                  UploadFile,
                  SearchPanel,
                  EditFileView,
                  OperationsView,
                  ImageView,
                  LayersView,
                  SelectDeviceView,
                  DevicesView,
                  DeviceView,
                  RenderAssetView,
                  DisplayView,
                  UserModel,
                  LayerModel,
                  AssetModel
                 ) {
        "use strict";

        return {
            initialize: function (options) {
                this.options = options;
                //this.user_model = new UserModel();
            },
            
            index: function () {
                app.header.show(new IndexHeaderView(app.options));
                app.footer.show(new Footer(app.options));
                
            },
            
            register: function () {
                app.body.show(new RegisterView({
                    model: this.user_model
                }));
                
                app.footer.show(new Footer(app.options));
            },
            
            login: function () {
                app.body.show(new LoginView({
                    model: this.user_model
                }));
                app.footer.show(new Footer(app.options));
            },

            listFiles: function () {
                var user_model = new UserModel();
                
                app.header.show(new Header({
                    model: user_model,
                    tab: "explore"
                }));

                //this.collection = new FilesCollectionModel();
                this.collection = new AssetsCollectionModel();
                var self = this;
                this.collection.fetch({
                    success: function (files) {
                        //var filesView = new FilesCollectionView({ collection: self.collection });
                        var assetsView = new AssetsCollectionView({ collection: self.collection });
                        app.body.show(new BodyView({
                            searchPanel: new SearchPanel(),
                            uploadFile: new UploadFile(),
                            //filesView: filesView
                            assetsView: assetsView
                        }));
                    }
                });
                app.footer.show(new Footer(app.options));
            },

            editFile: function (path) {
                //console.log("path in controller" + path);
                var user_model = new UserModel();
                app.header.show(new Header({
                    model: user_model,
                    tab: "edit"
                }));
                
                var layerModel = new LayerModel();
                this.model = new AssetModel({path: path});
                
                var self = this;
                this.model.fetch({
                    success: function (asset) {
                        app.body.show(new EditFileView({
                            operations: new OperationsView({
                                model: layerModel
                            }),
                            image: new ImageView({
                                model: self.model,
                                path: path
                            }),
                            layers: new LayersView()
                        }));
                    }
                });

                app.footer.show(new Footer(app.options));
            },
            
            selectDevice: function (path) {
                var user_model = new UserModel();
                app.header.show(new Header({
                    model: user_model,
                    tab: "select"
                }));
                
                this.model = new AssetModel({path: path});
                
                var self = this;
                this.model.fetch({
                    success: function (asset) {
                        app.body.show(new SelectDeviceView({
                            devices: new DevicesView({
                                
                            }),
                            device: new DeviceView({
                                model: self.model,
                                path: path
                            })
                        }));
                    }
                });
                app.footer.show(new Footer(app.options));
            },
            
            renderAsset: function (path) {
                var user_model = new UserModel();
                app.header.show(new Header({
                    model: user_model,
                    tab: "render"
                }));
                
                this.model = new AssetModel({path: path});
                
                var self = this;
                this.model.fetch({
                    success: function (asset) {
                        app.body.show(new RenderAssetView({
                            devices: new DevicesView({
                                
                            }),
                            display: new DisplayView({
                                model: self.model,
                                path: path
                            })
                        }));
                    }
                });
                app.footer.show(new Footer(app.options));
            }
        };
    });
