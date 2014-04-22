// START: APM service code injection
// Require the apm module

if(OS_IOS || OS_ANDROID){
	try {
		Alloy.Globals.apm = require("com.appcelerator.apm");
	}
	catch (e) {
		Ti.API.info("com.appcelerator.apm module is not available");
	}
	
	// Initialize the module if it is defined
	Alloy.Globals.apm && Alloy.Globals.apm.init && Alloy.Globals.apm.init();
} else {
	Alloy.Globals.apm ={};
	Alloy.Globals.apm.leaveBreadcrumb = function(){};
}
// END: APM code injection

// //Setup V2 Maps Module
// var map = OS_IOS || OS_ANDROID?require("ti.map"):Ti.Map;

Alloy.Globals.customMapView = (function(){
	return Ti.UI.createView({
		backgroundColor:"blue",
		height:100,
		width:100,
		opacity:"50%"
	});
})();
//Global variable for storing current location
Alloy.Globals.myLoc= {latitude:37.389569, longitude:-122.051651, latitudeDelta:0.5, longitudeDelta:0.5};