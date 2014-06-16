//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation
var animation = require('alloy/animation');
//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.dialogs
var dialogs = require('alloy/dialogs');
//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.measurement
var measurement = require('alloy/measurement');
//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.sha1//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.moment
var moment = require('alloy/moment');
//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.sha1
var sha1 = require('alloy/sha1');
http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.string
var string = require('alloy/string');

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
	//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation-method-shake
	animation.shake($.flipper, 0);
}

/**
 * Flash animation
 * */
function flash(e) {
	//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation-method-flash
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
		//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation-method-flip
		animation.flipHorizontal(front, back, 500);
	}
}

/**
 * Fadein animation
 * */
function fadeIn(e) {
	//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation-method-fadeIn
	animation.fadeIn($.flipper, 500);
}

/**
 * Fadeout animation
 * */
function fadeOut(e) {
	//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.animation-method-fadeOut
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
		//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.measurement-method-dpToPX
		$.pxField.value = measurement.dpToPX($.dpField.value.trim()) ;
	}
}

/**
 * Formats date using the Alloy builtin date formatter
 * @param {Object} e
 */
function formatDate(e){
	if($.dateInput.value.trim() !== ""){
		//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.moment
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
	//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.dialogs-method-confirm
	dialogs.confirm({
		yes:L('ok'),
		no:L('cancel'),
		callback: function(e){
			$.dateInput.value = "";
			$.resultDate.text = L('result');
			$.dateFormat.value = "";
		}
	});
}

/**
 * SHA1 encryption
 * @param {Object} e
 */
function encryptSha1 (e) {
 if($.sha1Input.value.trim() !== ""){
 	//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.sha1-method-b64_sha1
 	$.sha1ResultLabel.text = sha1.b64_sha1($.sha1Input.value.trim());
 } 
}

/**
 * Makes the first character of the string upper case.
 * @param {Object} e
 */
function upperCaseFirstCharacter(e){
	if($.stringInput.value.trim() != ""){
		//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.string-method-ucfirst
		$.stringResultLabel.text = string.ucfirst($.stringInput.value.trim());
	}
	
}

/**
 * Lowercases the first character in the string.
 * @param {Object} e
 */
function lowerCaseFirstCharacter(e){
	if($.stringInput.value.trim() != ""){
		//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.string-method-lcfirst
		$.stringResultLabel.text = string.lcfirst($.stringInput.value.trim());
	}
}

/**
 * Removes trailing zeroes from a float value after the decimal point.
 * @param {Object} e
 */
function trimZeros(e){
	if($.stringInput.value.trim() != ""){
		//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.string-method-trimZeros
		$.stringResultLabel.text = string.trimZeros($.stringInput.value.trim());
	}
	
}

/**
 * Removes leading and trailing white space from a string.
 * @param {Object} e
 */
function trim(e){
	if($.stringInput.value.trim() != ""){
		//http://docs.appcelerator.com/titanium/latest/#!/api/Alloy.builtins.string-method-trim
		$.stringResultLabel.text = string.trim($.stringInput.value.trim());
	}
	
}

initialize();
