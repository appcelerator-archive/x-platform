/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('sms'));
}


/**
 * Closes the window
 * */
function closeWindow() {
	$.smsWin.close();
}


//Screen Initialization
initialize();
