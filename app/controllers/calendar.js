/**
 * Screen Initialization
 * */
function initialize(){
	$.topBar.back.addEventListener('click',closeWindow);
	$.topBar.setTitle('Calendar');
}

/**
 * Closes the window 
 * */
function closeWindow(){
	(OS_IOS)?Alloy.Globals.navGroup.closeWindow($.calendarWin): $.calendarWin.close();
}

initialize();