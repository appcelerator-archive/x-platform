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
 * encrypts the text entered by user
 */
function encrypt() {
	$.originalText.blur();
	$.label2.enabled = true;
	$.encryptedText.enabled = true;
	
	//Encryption of text
	var crypto = require("/crypto");
	crypto.init("KEYSIZE_AES128");
	$.encryptedText.text = crypto.encrypt({
		source : $.originalText.getValue(),
		type : "TYPE_HEXSTRING"
	});
}

/**
 * Closes the window
 * */
function closeWindow() {
	(OS_IOS) ? Alloy.Globals.navGroup.closeWindow($.encryptionWin) : $.encryptionWin.close();
}

initialize();
