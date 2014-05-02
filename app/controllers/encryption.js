/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('encryption'));
}

/**
 * EVENT LISTENER
 */
/**
 * encrypts the text entered by user
 */
function encrypt(e) {
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
 * Clears the original text as well as the encrypted text and sets focus in the text box.
 */
function clearText(e){
	$.originalText.value= "";
	$.originalText.focus();
	$.encryptedText.text = "";
	$.label2.enabled = false;
	$.encryptedText.enabled = false;
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.encryptionWin.close();
}

initialize();
