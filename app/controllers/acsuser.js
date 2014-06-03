/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('acs_user'));
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.acsuserWin.close();
}

function openCreateView(e) {
	$.userView.visible = true;
	var height = $.userView.height === 1 ? Ti.UI.SIZE : 1;
	$.userView.animate(Ti.UI.createAnimation({
		height : height,
		duration : 200
	}), function() {
		$.userView.height = height;
		$.userView.visible = $.userView.height === 1 ? false : true;
	});
}

function openLoginView(e) {
	$.loginView.visible = true;
	var height = $.loginView.height === 1 ? Ti.UI.SIZE : 1;
	$.loginView.animate({
		height : height,
		duration : 200
	}, function() {
		$.loginView.height = height;
		$.loginView.visible = $.loginView.height === 1 ? false : true;
	});
}

initialize();
