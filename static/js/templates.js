define(function (require) {
    "use strict";

    return {
        indexHeader : require('tpl!templates/indexHeader.tmpl'),
        register    : require('tpl!templates/register.tmpl'),
        login       : require('tpl!templates/login.tmpl'),
        header      : require('tpl!templates/header.tmpl'),
        body        : require('tpl!templates/body.tmpl'),
        sidebar     : require('tpl!templates/sidebar.tmpl'),
        footer      : require('tpl!templates/footer.tmpl'),
        uploadFile  : require('tpl!templates/uploadFile.tmpl'),
        searchPanel  : require('tpl!templates/searchPanel.tmpl'),
        asset        : require('tpl!templates/asset.tmpl'),
        editFile    : require('tpl!templates/editFile.tmpl'),
        operations  : require('tpl!templates/operations.tmpl'),
        image       : require('tpl!templates/image.tmpl'),
        layers      : require('tpl!templates/layers.tmpl'),
        selectDevice: require('tpl!templates/selectDevice.tmpl'),
        devices     : require('tpl!templates/devices.tmpl'),
        device      : require('tpl!templates/device.tmpl'),
        renderAsset: require('tpl!templates/renderAsset.tmpl'),
        display      : require('tpl!templates/display.tmpl'),
    };
});

