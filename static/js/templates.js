define(function (require) {
    "use strict";

    return {
        header      : require('tpl!templates/header.tmpl'),
        body        : require('tpl!templates/body.tmpl'),
        sidebar     : require('tpl!templates/sidebar.tmpl'),
        footer      : require('tpl!templates/footer.tmpl'),
        uploadFile  : require('tpl!templates/uploadFile.tmpl'),
        file        : require('tpl!templates/file.tmpl'),
        editFile    : require('tpl!templates/editFile.tmpl'),
        operations  : require('tpl!templates/operations.tmpl'),
        image       : require('tpl!templates/image.tmpl'),
        layers      : require('tpl!templates/layers.tmpl')
    };
});

