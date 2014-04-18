var App = {
    controllers:{},
    crypto:null,

    loadObject:function (type, name, params) {
        if (App[type] == null) {
            Ti.API.warn('Trying to load an object that does not exist in the App namespace');
            return false;
        } else if (App[type][name] == null) {
            Ti.include(type.toLowerCase() + '/' + name + '.js');
            Ti.API.info(type + ' ' + name + ' loaded');
            return new App[type][name](params);
        } else {
            Ti.API.info(type + ' ' + name + ' already loaded');
            return new App[type][name](params);
        }
    }
};

// Load the crypto modules
var Crypto = require('ti.crypto');

Ti.include('ui.js');
Ti.include('test.js');

App.UI.createAppWindow().open();
