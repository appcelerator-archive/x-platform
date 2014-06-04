/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('acs_acl'));
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.acsAclWin.close();
}

function openView(e){
	toggleView(e.source);
}

function openCreateView(e) {
	$.createView.visible = true;
	var height = $.createView.height === 1 ? Ti.UI.SIZE : 1;
	$.createView.animate(Ti.UI.createAnimation({
		height : height,
		duration : 200
	}), function() {
		$.createView.height = height;
		$.createView.visible = $.createView.height === 1 ? false : true;
	});
}

function openShowView(e) {
	$.showView.visible = true;
	var height = $.showView.height === 1 ? Ti.UI.SIZE : 1;
	$.showView.animate({
		height : height,
		duration : 200
	}, function() {
		$.showView.height = height;
		$.showView.visible = $.showView.height === 1 ? false : true;
	});
}

function openUpdateView(e) {
	$.updateView.visible = true;
	var height = $.updateView.height === 1 ? Ti.UI.SIZE : 1;
	$.updateView.animate({
		height : height,
		duration : 200
	}, function() {
		$.updateView.height = height;
		$.updateView.visible = $.updateView.height === 1 ? false : true;
	});
}

function openCheckView(e) {
	$.checkView.visible = true;
	var height = $.checkView.height === 1 ? Ti.UI.SIZE : 1;
	$.checkView.animate({
		height : height,
		duration : 200
	}, function() {
		$.checkView.height = height;
		$.checkView.visible = $.checkView.height === 1 ? false : true;
	});
}

initialize();