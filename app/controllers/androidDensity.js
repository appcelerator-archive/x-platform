/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle( L('androidDensity'));

}



/**
 * Closes the window
 * */
function closeWindow() {
	$.androidDensityWin.close();
}


initialize();
