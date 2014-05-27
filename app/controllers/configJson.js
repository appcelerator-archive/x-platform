/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('config_json'));
	$.lblConfig.text = L("build_on") + Alloy.CFG.os;
	if (Alloy.CFG.env) {
		$.lblConfig.text = $.lblConfig.text.concat(L("env_is") + Alloy.CFG.env);
	}
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.configJsonWin.close();
}

initialize();
