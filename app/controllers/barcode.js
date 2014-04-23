/**
 * Screen Initialization
 * */
function initialize(){
	$.topBar.back.addEventListener('click',closeWindow);
	$.topBar.setTitle('Barcode');
}

/**
 * Closes the window 
 * */
function closeWindow(){
	(OS_IOS)?Alloy.Globals.navGroup.closeWindow($.barcodeWin): $.barcodeWin.close();
}

initialize();