/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('model'));
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.modelWin.close();
}

initialize();
