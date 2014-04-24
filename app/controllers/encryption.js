/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.back.addEventListener('click', closeWindow);
	$.topBar.setTitle('Encryption');
}


/**
 * EVENT LISTENER
 */

/**
 * encrypts a sample text
 */
function encrypt() {
	var crypto = require("/crypto");
	crypto.init("KEYSIZE_AES128");
	alert("'This is my text to be encrypted.'\nThis is the encrypted text: " + crypto.encrypt({
		source : "This is my text to be encrypted.",
		type : "TYPE_HEXSTRING"
	}));

}

/**
 * Closes the window
 * */
function closeWindow() {
	(OS_IOS) ? Alloy.Globals.navGroup.closeWindow($.encryptionWin) : $.encryptionWin.close();
}

initialize();
