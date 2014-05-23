//Initializes the module
//http://bencoding.com/2012/02/12/titanium-sms-module/
if (OS_IOS) {
	var SMS = require('bencoding.sms').createSMSDialog({
		barColor : "#a22621"
	});
}

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('sms'));

	if (OS_IOS) {
		//Add the listeners to know about the action taken
		SMS.addEventListener('cancelled', displayMessage);
		SMS.addEventListener('completed', displayMessage);
		SMS.addEventListener('errored', displayMessage);
	}

};

/**
 * Opens sms dialog
 * */
function openSmsDialog() {
	var message = L("sms_message");
	var mobNumber = (OS_IOS) ? $.txtMobileNo.value.split(",") : $.txtMobileNo.value;
	if (OS_IOS) {
		openSmsDialogIOS(mobNumber, message);
	} else if (OS_ANDROID) {
		openSmsDialogAndroid(mobNumber, message);
	}
};

/**
 * Opens sms dialog for IOS
 * */
function openSmsDialogIOS(mobNumber, message) {

	//Check whether device can send SMS
	if (!SMS.canSendText) {
		displayMessage({
			title : L("sms_alert_title"),
			message : L("sms_failure_message")
		});
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
function openSmsDialogAndroid(mobNumber, message) {
	var intent = Ti.Android.createIntent({
		action : Ti.Android.ACTION_VIEW,
		type : 'vnd.android-dir/mms-sms',
	});
	intent.putExtra('sms_body', message);
	intent.putExtra("address", mobNumber);
	try {
		Ti.Android.currentActivity.startActivity(intent);
		// commenting as sms dialog callbacks is not closed after one tap.Problem with heavy weight window
		/*Ti.Android.currentActivity.startActivityForResult(intent, function(e) {
			var result;
			if (e.resultCode == Ti.Android.RESULT_OK) {
				result = L("message_sent");
			} else if (e.resultCode == Ti.Android.RESULT_CANCELED) {
				result = L("message_cancelled");
			}
			displayMessage({
				message : result
			});
		});*/

	} catch (ActivityNotFoundException) {
		displayMessage({
			message : L("message_error")
		});
		;
	}
};

/**
 * Displays the message
 * */
function displayMessage(e) {
	var alert = Ti.UI.createAlertDialog({
		title : (e.title) ? e.title : L("status"),
		message : e.message
	}).show();
	$.txtMobileNo.value = "";
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.smsWin.close();
	if (OS_IOS) {
		SMS.removeEventListener('cancelled', displayMessage);
		SMS.removeEventListener('completed', displayMessage);
		SMS.removeEventListener('errored', displayMessage);
	}
};

//Screen Initialization
initialize();
