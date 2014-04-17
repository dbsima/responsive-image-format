var BooksController = Backbone.Marionette.Controller.extend({
    initialize: function (options) {
        var self = this;
 
        // Hook up the add book event
        sampleApp.on("bookAdd", function (book) {
            self.UploadFile(book);
        });
    },
 
    ShowAddBookView: function (options) {
        var uploadFileView = new UploadFileView();
 
        options.region.show(addBookView);
    },
 
    UploadFile: function (book) {
        var BookToSave = book;
        var self = this;
 
        BookToSave.save({}, {
            success: function (model, respose, options) {
                console.log("The model has been saved to the server");
                self.collection.push(model);
            },
            error: function (model, xhr, options) {
                console.log("Something went wrong while saving the model");
            }
        });
    }
});