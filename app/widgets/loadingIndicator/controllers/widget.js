//show activityIndicator
exports.show = function(indicatorText) {
	$.indicator.show();
	$.container.visible = true;

	switch(indicatorText) {
		case 'REFRESH' :
			$.message.text = "Refreshing";
			break;

		case 'LOGOUT':
			$.message.text = "Logging Out";
			break;

		case 'AUTHORIZE':
			$.message.text = "Authorizing";
			break;
			
		case 'PROCESSING':
			$.message.text = "Processing";
			break;	
		default:
			$.message.text = indicatorText;
	}
	
	if (indicatorText.length >= 9) {
		$.message.setWidth = Ti.Platform.osname==='android'?'200dp':200;
	} else {
		$.message.width = Ti.Platform.osname==='android'?'140dp':140;
	}
};

// Update the activityIndicator
exports.updateText = function(value){
	$.message.setText(value);
};

//hide activityIndicator
exports.hide = function() {
	$.container.visible = false;
	$.indicator.hide();
};

