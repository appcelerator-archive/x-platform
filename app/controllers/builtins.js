//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation
var animation = require('alloy/animation');
//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.dialogs
var dialogs = require('alloy/dialogs');
//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.measurement
var measurement = require('alloy/measurement');
//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.moment
var moment = require('alloy/moment');

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


/**
 * Changes unit from dp to px
 * @param {Object} e
 */
function changedpToPX(e){
	if($.dpField.value.trim() !== "" && !isNaN($.dpField.value.trim())){
		$.pxField.value = measurement.dpToPX($.dpField.value.trim()) ;
	}
}

/**
 * Formats date using the Alloy builtin date formatter
 * @param {Object} e
 */
function formatDate(e){
	if($.dateInput.value.trim() !== ""){
		var day = moment($.dateInput.value.trim(), "MM-DD-YYYY");
		$.resultDate.text = day.format($.dateFormat.value.trim());
	}
}

/**
 * Clears the text from the input fields
 * @param {Object} e
 */
function clearFields(e){
	//Open the dialog to take the user confirmation
	dialogs.confirm({
		yes:L('ok'),
		no:L('cancel'),
		callback: function(e){
			$.dateInput.value = "";
			$.resultDate.text = "";
			$.dateFormat.value = "";
		}
	});
}

initialize();
