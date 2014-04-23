/**
 * Screen Initialization
 * */
function initialize(){
	$.topBar.back.addEventListener('click',closeWindow);
	$.topBar.setTitle('Encryption');
}

/**
 * Closes the window 
 * */
function closeWindow(){
	(OS_IOS)?Alloy.Globals.navGroup.closeWindow($.encryptionWin): $.encryptionWin.close();
}

initialize();