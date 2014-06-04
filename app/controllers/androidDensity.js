/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle( L('androidDensity'));
	$.info.text=$.info.text+"\n"+Ti.Platform.displayCaps.platformWidth+" x "+Ti.Platform.displayCaps.platformHeight+" "+Ti.Platform.displayCaps.density+" density";
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.androidDensityWin.close();
}

initialize();
