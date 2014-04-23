/**
 * Screen Initialization
 * */
function initialize(){
	$.topBar.back.addEventListener('click',closeWindow);
	$.topBar.setTitle('Camera');
}

/**
 * Closes the window 
 * */
function closeWindow(){
	(OS_IOS)?Alloy.Globals.navGroup.closeWindow($.cameraWin): $.cameraWin.close();
}

initialize();
