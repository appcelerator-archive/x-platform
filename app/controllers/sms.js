//Initializes the module
//http://bencoding.com/2012/02/12/titanium-sms-module/
var SMS = require('bencoding.sms').createSMSDialog({
	barColor : "#a22621"
});

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('sms'));

	//Add the listeners to know about the action taken
	SMS.addEventListener('cancelled', displayMessage);
	SMS.addEventListener('completed', displayMessage);
	SMS.addEventListener('errored', displayMessage);
};

/**
 * Opens sms dialog
 * */
function openSmsDialog() {
	if (OS_IOS) {
		openSmsDialogIOS();
	} else if (OS_ANDROID) {
		openSmsDialogAndroid();
	}
};

/**
 * Opens sms dialog for IOS
 * */
function openSmsDialogIOS() {
	var message = L("sms_message");
	var mobNumber = $.txtMobileNo.value.split(",");
	//Check whether device can send SMS
	if (!SMS.canSendText) {
		var noSupport = Ti.UI.createAlertDialog({
			title : L("sms_alert_title"),
			message : L("sms_failure_message")
		}).show();
		return;
	}

	//Set the SMS message
	SMS.setMessageBody(message);
	//Set the SMS ToRecipients, multiple numbers can be sent
	SMS.setToRecipients(mobNumber);
	SMS.open({
		animated : true
	});
};

/**
 * Opens sms dialog for Android
 * */
function openSmsDialogAndroid() {

};

/**
 * Displays the message
 * */
function displayMessage(result) {
	alert(result.message);
	$.txtMobileNo.value = "";
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.smsWin.close();
	SMS.removeEventListener('cancelled', displayMessage);
	SMS.removeEventListener('completed', displayMessage);
	SMS.removeEventListener('errored', displayMessage);
};

//Screen Initialization
initialize();
