define(['app', 'vent', 'models/FilesCollection', 'views/FilesCollection', 'views/Body', 'views/Header', 'views/Footer'], function (app, vent, FilesCollectionModel, FilesCollectionView, BodyView, Header, Footer) {
    "use strict";

    return {
        initialize: function (options) {
            this.options = options;
            console.log("test in initialize" + this.options);
        },
        
        listFiles: function () {
            this.collection = new FilesCollectionModel();
            console.log("listFiles");
            var self = this;
            this.collection.fetch({
                success: function (files) {
                    app.header.show(new Header(app.options));
                    
                    var filesView = new FilesCollectionView({ collection: self.collection });
                    
                    app.body.show(new BodyView(filesView));
                    
                    app.footer.show(new Footer(app.options));
                }
            });
        },
        
        setFilter : function (param) {
            vent.trigger('todoList:filter', param.trim() || '');
        },

        filesIndex: function () {
            vent.trigger('files:index');
        },
        
        groupsIndex: function () {
            vent.trigger('groups:index');
        },
        groupNew: function (parent_id) {
            vent.trigger('group:new', { parent_id: parseInt(parent_id)});
        },
        groupCreate: function (parent_id) {
            vent.trigger('group:create', { parent_id: parseInt(parent_id)});
        },
        groupShow: function (group_id) {
            vent.trigger('group:show', group_id);
        },
        groupEdit: function (group_id) {
            vent.trigger('group:edit', group_id);
        },
        groupUpdate: function (group_id) {
            vent.trigger('group:update', group_id);
        },
        groupDelete: function (group_id) {
            vent.trigger('group:delete', group_id);
        },
        groupUserShow: function (group_id, user_id) {
            vent.trigger('groupUser:show', group_id, user_id);
        },
        groupCategoryShow: function (group_id, category_id) {
            vent.trigger('groupCategory:show', group_id, category_id);
        },
        groupUserCategoryShow: function (group_id, user_id, category_id) {
            vent.trigger('groupUserCategory:show', group_id, user_id, category_id);
        }
    };
});
