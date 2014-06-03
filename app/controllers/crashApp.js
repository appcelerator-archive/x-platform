var args = arguments[0] || {};

function initialize(){
	$.topBar.imageContainer.addEventListener('click',closeWindow);
	$.topBar.setTitle(L('crash_exceptions'));
}

function crash(){
	var ctd = require("ti.crashtestdummy");
	Alloy.Globals.apm.leaveBreadcrumb("Crashing the app");
	ctd.accessBadMemory();
}

function exception(){
	Alloy.Globals.apm.leaveBreadcrumb("Throwing an exception");
	try {
		fake.error();
	} catch(e) {
		recordException();
	}
}

function recordException(){
	if(OS_IOS){
	Alloy.Globals.apm.logHandledException({
		name: "Cross Platform Handled Exception",
		message: "This is an example Handled Exception from the Appcelerator Cross Platform App",
		line: "27"
	});
	}
	alert("Exception Fired.");
}

/**
 * Closes the window 
 * */
function closeWindow(){
	$.crashAppWin.close();
}

initialize();