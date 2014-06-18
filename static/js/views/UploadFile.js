/*global define*/

define(['marionette', 'vent', 'templates'], function (Marionette, vent, templates) {
    "use strict";

    return Marionette.Layout.extend({
        template : templates.uploadFile,
        tagName: 'div',

        events : {
            'change #uploadImage': 'onUploadImage'
        },

        onUploadImage: function(options) {
            var isSelected = document.getElementById('uploadImage').value;

            if (isSelected) {
                console.log($('#uploadImage')[0].files[0]);
                var form_data = new FormData();
                form_data.append("image", "bla");
                form_data.append('file', $('#uploadImage')[0].files[0] );
                var self = this;
                $.ajax({
                    url: "/assets",
                    dataType: 'text',
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: form_data,
                    type: 'POST',
                    success: function (response) {
                        //$('#myModal').modal('show');
                        // rerender stage after new smart shape added
                        //self.initialize();
                        //self.render();
                    },
                    error: function (response) {
                        console.log("error POST on /layers");
                        //console.log(response);
                    }
                });
            }
        },


    });
});