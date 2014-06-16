// START: APM service code injection
// Require the apm module

if (OS_IOS || OS_ANDROID) {
	try {
		Alloy.Globals.apm = require("com.appcelerator.apm");
	} catch (e) {
		Ti.API.info("com.appcelerator.apm module is not available");
	}

	// Initialize the module if it is defined
	Alloy.Globals.apm && Alloy.Globals.apm.init && Alloy.Globals.apm.init();
} else {
	Alloy.Globals.apm = {};
	
	//In case apm is not installed, so the leaveBreadcrumb calls to break the app.
	Alloy.Globals.apm.leaveBreadcrumb = function() {
	};
}
// END: APM code injection

// //Setup V2 Maps Module (Used for mapDrawing module);

Alloy.Globals.Map = OS_IOS || OS_ANDROID?require("ti.map"):Ti.Map;

Alloy.Globals.customMapView = (function() {
	return Ti.UI.createView({
		backgroundColor : "blue",
		height : 100,
		width : 100,
		opacity : "50%"
	});
})();

/**
 * Set the top as per the status bar
 * */
Alloy.Globals.adjustStatusBar = function(container) {
	if (OS_IOS && Ti.Platform.version.split('.')[0] >= 7) {
		container.top = 20;
	}
};


/**
 * Name of Local DB
 */
Alloy.Globals.db = "Employee";

/**
 * Adding book collection to alloy 
 * */
if(OS_IOS || OS_ANDROID || OS_BLACKBERRY){
	Alloy.Collections.book = Alloy.createCollection('book');
}

/*
 * Adding required variables and functions to quickly wrap the ti.cloud examples
 * TODO: Should be cleaned up and added to commonJS module for acsExamples
 */
var Cloud = require('ti.cloud');
var pushToken = '';
Cloud.debug = true;

// Find out if this is iOS 7 or greater
function isIOS7Plus() {
    if (Titanium.Platform.name == 'iPhone OS') {
        var version = Titanium.Platform.version.split(".");
        var major = parseInt(version[0],10);
        // can only test this support on a 3.2+ device
        if (major >= 7) {
            return true;
        }
    }
    return false;

}
var IOS7 = isIOS7Plus();
var top = IOS7 ? 20 : 0;

// Define our window store.



// Utility functions for defining windows.
u = Ti.Android != undefined ? 'dp' : 0;

windowFunctions = {};

createWindow = function() {
    return Ti.UI.createWindow({
        backgroundColor: '#fff',
        navBarHidden: true
    });
};

handleOpenWindow = function(evt) {
    var target = (evt.row && evt.row.title) || evt.target;
    if (windowFunctions[target]) {
        windowFunctions[target](evt);
    }
};


addBackButton = function (win) {
    if (Ti.Android) {
        return 0;
    }
    var back = Ti.UI.createButton({
        title: 'Back',
        color: '#fff', 
        backgroundColor: "#a22621",
        style: 0,
        top: top, left: 0, right: 0,
        height: 40 + u
    });
    back.addEventListener('click', function (evt) {
        win.close();
    });
    win.add(back);
    return 40 + top;
};

createRows = function(rows) {
    for (var i = 0, l = rows.length; i < l; i++) {
        rows[i] = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            title: rows[i],
            hasChild: true,
            height: 30 + u,
            font: { fontSize: 20 + u }
        });
    }
    return rows;
};

enumerateProperties = function(container, obj, offset) {
    for (var key in obj) {
        if (!obj.hasOwnProperty(key))
            continue;
        container.add(Ti.UI.createLabel({
            text: key + ': ' + obj[key], textAlign: 'left',
            color: '#000', backgroundColor: '#fff',
            height: 30 + u, left: offset, right: 20 + u
        }));
        if (obj[key].indexOf && obj[key].indexOf('http') >= 0 
            && (obj[key].indexOf('.jpeg') > 0 || obj[key].indexOf('.jpg') > 0 || obj[key].indexOf('.png') > 0)) {
            container.add(Ti.UI.createImageView({
                image: obj[key],
                height: 120 + u, width: 120 + u,
                left: offset
            }));
        }
        if (typeof(obj[key]) == 'object') {
            enumerateProperties(container, obj[key], offset + 20);
        }
    }
};

error = function(e) {
    var msg = (e.error && e.message) || JSON.stringify(e);
    if (e.code) {
        alert(msg);
    } else {
        Ti.API.error(msg);
    }
};

convertISOToDate = function(isoDate) {
    isoDate = isoDate.replace(/\D/g," ");
    var dtcomps = isoDate.split(" ");
    dtcomps[1]--;
    return new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));
};
