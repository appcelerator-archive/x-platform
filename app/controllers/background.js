/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('background'));

}

/**
 * Event Listener
 */
/**
 * Toggle stretch of the image  
 */
function stretchImage(e) {
	if ($.bgImage.height !== 100) {
		$.bgImage.height = 100;
		$.bgImage.width = 100;
	} else {
		$.bgImage.height = Ti.UI.FILL;
		$.bgImage.width = Ti.UI.FILL;
	}

}

/**
 * Closes the window
 * */
function closeWindow() {
	$.backgroundWin.close();
}

initialize();
