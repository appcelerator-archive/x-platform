//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation
var animation = require('alloy/animation');

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('builtins'));

}

/**
 * Shake animation
 * */
function shake(e) {
	animation.shake($.flipper, 0);
}

/**
 * Flash animation
 * */
function flash(e) {
	animation.flash($.flipper);
}

/**
 * Flip animation
 * */
function flip(e) {
	if (OS_IOS) {
		var front, back;
		e.bubbleParent = false;
		if (e.source === $.back) {
			front = $.back;
			back = $.front;
		} else {
			front = $.front;
			back = $.back;
		}
		animation.flipHorizontal(front, back, 500);
	}
}

/**
 * Fadein animation
 * */
function fadeIn(e) {
	animation.fadeIn($.flipper, 500);
}

/**
 * Fadeout animation
 * */
function fadeOut(e) {
	animation.fadeOut($.flipper, 500);
}


/**
 * Closes the window
 * */
function closeWindow() {
	$.builtinsWin.close();
}

initialize();
