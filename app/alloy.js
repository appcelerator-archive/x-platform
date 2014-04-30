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
	Alloy.Globals.apm.leaveBreadcrumb = function() {
	};
}
// END: APM code injection

// //Setup V2 Maps Module
// var map = OS_IOS || OS_ANDROID?require("ti.map"):Ti.Map;

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
