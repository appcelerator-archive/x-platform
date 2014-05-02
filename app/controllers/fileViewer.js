var params = arguments[0] || {};

/**
 * Screen Initialization
 * */
function initialize() {
	var args = params.data;
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(args.titleText);
	//Sets the top for ios>=7
	if (Ti.Platform.version.split('.')[0] >= 7) {
		$.webview.top = 65;
	} else {
		$.webview.top = 45;
	}

	//opening a remote webpage
	if (args.url) {
		Ti.API.info("File URL ------>" + args.url);
		$.webview.setUrl(args.url);
	}

	//opening a local webpage
	if (args.html) {
		Ti.API.info("File URL ------>" + args.html);
		$.webview.setHtml(args.html);
	}

	//Print and Reload buttons
	if (args.print == "true" && OS_IOS) {
		$.print.show();
		$.reload.hide();
	} else {
		$.print && $.print.hide();
		$.reload.show();
	}

}

/**
 * EVENT LISTENERS
 */
/**
 * back Navigation
 */
function back() {
	$.webview.goBack();
}

/**
 * forward Navigation
 */
function forward() {
	Ti.App.fireEvent("app:fromTitanium");
}

/**
 * reload page
 */
function reload() {
	$.webview.reload();
}

/**
 * Prints documents
 */
function print(evt) {
	var AirPrint = require('ti.airprint');
	if (!AirPrint.canPrint()) {
		alert('This version of iOS does not support AirPrint! Please upgrade.');
	}

	AirPrint.print({
		url : $.webview.url,
		showsPageRange : true,
		view : evt.source
	});
}

Ti.App.addEventListener('app:fromWebView', function(e) {
	alert(e.message);
});

/**
 * Closes the window
 * */
function closeWindow() {
	$.fileViewer.close();
}

initialize();
