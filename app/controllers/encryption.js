/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.back.addEventListener('click', closeWindow);
	$.topBar.setTitle('Encryption');
}

function encrypt() {
	$.originalText.blur();
	if (OS_IOS) {
		var crypto = require("/crypto");
		crypto.init("KEYSIZE_AES128");
		$.label2.enabled = true;
		$.encryptedText.enabled = true;
		$.encryptedText.text = crypto.encrypt({
			source : $.originalText.value,
			type : "TYPE_HEXSTRING"
		});
	}
}

/**
 * Closes the window
 * */
function closeWindow() {
	(OS_IOS) ? Alloy.Globals.navGroup.closeWindow($.encryptionWin) : $.encryptionWin.close();
}

initialize();
