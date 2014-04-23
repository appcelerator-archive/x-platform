/**
 * Screen Initialization
 * */
function initialize(){
	$.topBar.back.addEventListener('click',closeWindow);
	$.topBar.setTitle('Push Notifications');
}

/**
 * Closes the window 
 * */
function closeWindow(){
	(OS_IOS)?Alloy.Globals.navGroup.closeWindow($.pushnotoficationWin): $.pushnotoficationWin.close();
}

initialize();