/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('barcode'));
	buildUI();
}

/**
 * UI Creation
 * */
function buildUI() {
	if (OS_IOS || OS_ANDROID) {
		var Barcode = require('ti.barcode');
		Barcode.allowRotation = true;
		Barcode.displayedMessage = '';
		Barcode.useLED = true;
		
		var buttonView=Ti.UI.createView({
			backgroundColor:'transparent',
			height:Ti.UI.SIZE,
			top: 10,
			width:'95%'
		});
		var resultView=Ti.UI.createView({
			backgroundColor:'transparent',
			width:'95%',
			height:Ti.UI.SIZE,
			layout:'vertical',
			backgroundColor : "#444",
			top:10
		});
		
		var containerView=Ti.UI.createView({
			width:'100%',
			height:Ti.UI.SIZE,
			layout:'vertical'
		});
		containerView.add(resultView);
		containerView.add(buttonView);
		
		/**
		 * Create a chrome for the barcode scanner.
		 */
		var overlay = Ti.UI.createView({
			backgroundColor : 'transparent',
			top : 0,
			right : 0,
			bottom : 0,
			left : 0
		});
		var switchButton = Ti.UI.createButton({
			title : Barcode.useFrontCamera ? L('backCam') : L('frontCam'),
			textAlign : 'center',
			color : '#000',
			backgroundColor : '#fff',
			style : 0,
			font : {
				fontWeight : 'bold',
				fontSize : 16
			},
			borderColor : '#000',
			borderRadius : 10,
			borderWidth : 1,
			opacity : 0.5,
			width : 220,
			height : 30,
			bottom : 10
		});
		var oLogo = Ti.UI.createImageView({
			height : 40,
			width : 40,
			top : 30,
			left : 5,
			image : "/appicon.png"
		});
		overlay.add(oLogo);
		switchButton.addEventListener('click', function() {
			Barcode.useFrontCamera = !Barcode.useFrontCamera;
			switchButton.title = Barcode.useFrontCamera ? L('backCam') : L('frontCam');
		});
		overlay.add(switchButton);

		var toggleLEDButton = Ti.UI.createButton({
			title : Barcode.useLED ? L('ledOn') : L('ledOff'),
			textAlign : 'center',
			color : '#000',
			backgroundColor : '#fff',
			style : 0,
			font : {
				fontWeight : 'bold',
				fontSize : 16
			},
			borderColor : '#000',
			borderRadius : 10,
			borderWidth : 1,
			opacity : 0.5,
			width : 220,
			height : 30,
			bottom : 40
		});
		toggleLEDButton.addEventListener('click', function() {
			Barcode.useLED = !Barcode.useLED;
			toggleLEDButton.title = Barcode.useLED ? L('ledOn') : L('ledOff');
		});
		overlay.add(toggleLEDButton);

		var cancelButton = Ti.UI.createButton({
			title : L('cancel'),
			textAlign : 'center',
			color : '#000',
			backgroundColor : '#fff',
			style : 0,
			font : {
				fontWeight : 'bold',
				fontSize : 16
			},
			borderColor : '#000',
			borderRadius : 10,
			borderWidth : 1,
			opacity : 0.5,
			width : 220,
			height : 30,
			top : 30
		});
		cancelButton.addEventListener('click', function() {
			Barcode.cancel();
		});
		overlay.add(cancelButton);

		/**
		 * Create a button that will trigger the barcode scanner.
		 */
		var scanCode = Ti.UI.createButton({
			title : L("scan_code"),
			width : "31%",
			left:0,
			height: 40,
			style: (OS_IOS)? Titanium.UI.iPhone.SystemButtonStyle.PLAIN : 'none',
			backgroundColor:(Alloy.CFG.theme === 'blue') ? "#597c90":'#a22621',
			color:'#fff',
			font: {fontFamily : 'helveticaNeue', fontSize: "16"}
			
		});

		scanCode.addEventListener('click', function() {
			reset();
			// Note: while the simulator will NOT show a camera stream in the simulator, you may still call "Barcode.capture"
			// to test your barcode scanning overlay.
			Barcode.capture({
				animate : true,
				overlay : overlay,
				showCancel : false,
				showRectangle : false,
				keepOpen : true/*,
				 acceptedFormats: [
				 Barcode.FORMAT_QR_CODE
				 ]*/
			});
		});
		buttonView.add(scanCode);

		/**
		 * Create a button that will show the gallery picker.
		 */
		var scanImage = Ti.UI.createButton({
			title : L("scan_image"),
			width : "65%",
			right:0,
			height: 40,
			style: (OS_IOS)? Titanium.UI.iPhone.SystemButtonStyle.PLAIN : 'none',
			backgroundColor:(Alloy.CFG.theme === 'blue') ? "#597c90":'#a22621',
			color:'#fff',
			font: {fontFamily : 'helveticaNeue', fontSize: "16"}
		});
		
		scanImage.addEventListener('click', function() {
			reset();
			Ti.Media.openPhotoGallery({
				success : function(evt) {
					Barcode.parse({
						image : evt.media/*,
						 acceptedFormats: [
						 Barcode.FORMAT_QR_CODE
						 ]*/
					});
				}
			});
		});
		buttonView.add(scanImage);

		/**
		 * Now listen for various events from the Barcode module. This is the module's way of communicating with us.
		 */
		var scannedBarcodes = {}, scannedBarcodesCount = 0;
		function reset() {
			scannedBarcodes = {};
			scannedBarcodesCount = 0;
			cancelButton.title = L('cancel');

			scanResult.text = ' ';
			scanContentType.text = ' ';
			scanParsed.text = ' ';
		}


		Barcode.addEventListener('error', function(e) {
			scanContentType.text = ' ';
			scanParsed.text = ' ';
			scanResult.text = e.message;
		});
		Barcode.addEventListener('cancel', function(e) {
			Ti.API.info('Cancel received');
		});
		Barcode.addEventListener('success', function(e) {
			Ti.API.info('Success called with barcode: ' + e.result);
			if (!scannedBarcodes['' + e.result]) {
				scannedBarcodes[e.result] = true;
				scannedBarcodesCount += 1;
				cancelButton.title = L('finish') + scannedBarcodesCount + L('scanned');

				scanResult.text += e.result + ' ';
				scanContentType.text += parseContentType(e.contentType) + ' ';
				scanParsed.text += parseResult(e) + ' ';
			}
		});

		/**
		 * Finally, we'll add a couple labels to the window. When the user scans a barcode, we'll stick information about it in
		 * to these labels.
		 */
		resultView.add(Ti.UI.createLabel({
			text : L('rotateDevice'),
			top : 10,
			height : Ti.UI.SIZE || 'auto',
			width : Ti.UI.SIZE || 'auto',
			color:'#fff'
		}));

		resultView.add(Ti.UI.createLabel({
			text : L('result'),
			textAlign : 'left',
			top : 10,
			left : 10,
			color : 'black',
			height : Ti.UI.SIZE || 'auto',
			color:'#fff'
		}));
		var scanResult = Ti.UI.createLabel({
			text : ' ',
			textAlign : 'left',
			top : 10,
			left : 10,
			color : 'black',
			height : Ti.UI.SIZE || 'auto',
			color:'#fff'
		});
		resultView.add(scanResult);

		resultView.add(Ti.UI.createLabel({
			text : L('content'),
			top : 10,
			left : 10,
			textAlign : 'left',
			color : 'black',
			height : Ti.UI.SIZE || 'auto',
			color:'#fff'
		}));
		var scanContentType = Ti.UI.createLabel({
			text : ' ',
			textAlign : 'left',
			top : 10,
			left : 10,
			color : 'black',
			height : Ti.UI.SIZE || 'auto',
			color:'#fff'
		});
		resultView.add(scanContentType);

		resultView.add(Ti.UI.createLabel({
			text : L('parse'),
			textAlign : 'left',
			top : 10,
			left : 10,
			color : 'black',
			height : Ti.UI.SIZE || 'auto',
			color:'#fff'
		}));
		var scanParsed = Ti.UI.createLabel({
			text : ' ',
			textAlign : 'left',
			top : 10,
			left : 10,
			color : 'black',
			height : Ti.UI.SIZE || 'auto',
			color:'#fff'
		});
		resultView.add(scanParsed);

		function parseContentType(contentType) {
			switch (contentType) {
				case Barcode.URL:
					return 'URL';
				case Barcode.SMS:
					return 'SMS';
				case Barcode.TELEPHONE:
					return 'TELEPHONE';
				case Barcode.TEXT:
					return 'TEXT';
				case Barcode.CALENDAR:
					return 'CALENDAR';
				case Barcode.GEOLOCATION:
					return 'GEOLOCATION';
				case Barcode.EMAIL:
					return 'EMAIL';
				case Barcode.CONTACT:
					return 'CONTACT';
				case Barcode.BOOKMARK:
					return 'BOOKMARK';
				case Barcode.WIFI:
					return 'WIFI';
				default:
					return 'UNKNOWN';
			}
		}

		function parseResult(event) {
			var msg = '';
			switch (event.contentType) {
				case Barcode.URL:
					msg = 'URL = ' + event.result;
					break;
				case Barcode.SMS:
					msg = 'SMS = ' + JSON.stringify(event.data);
					break;
				case Barcode.TELEPHONE:
					msg = 'Telephone = ' + event.data.phonenumber;
					break;
				case Barcode.TEXT:
					msg = 'Text = ' + event.result;
					break;
				case Barcode.CALENDAR:
					msg = 'Calendar = ' + JSON.stringify(event.data);
					break;
				case Barcode.GEOLOCATION:
					msg = 'Latitude = ' + event.data.latitude + '\nLongitude = ' + event.data.longitude;
					break;
				case Barcode.EMAIL:
					msg = 'Email = ' + event.data.email + '\nSubject = ' + event.data.subject + '\nMessage = ' + event.data.message;
					break;
				case Barcode.CONTACT:
					msg = 'Contact = ' + JSON.stringify(event.data);
					break;
				case Barcode.BOOKMARK:
					msg = 'Bookmark = ' + JSON.stringify(event.data);
					break;
				case Barcode.WIFI:
					return 'WIFI = ' + JSON.stringify(event.data);
				default:
					msg = 'unknown content type';
					break;
			}
			return msg;
		}


		$.barcodeWin.add(containerView);
	} else {
		var webview = Ti.UI.createWebView({
			url : "http://zxing.org/w/decode.jspx",
			//top : 60
		});
		var back = Ti.UI.createLabel({
			text : "Back",
			width : Ti.UI.SIZE,
			height : 40,
			left : 10,
			top : 20,
			color : "#000"
		});

		back.addEventListener("click", function() {
			if (webview.canGoBack()) {
				webview.goBack();
			} else {
				closeWindow();
			}
		});

		$.barcodeWin.add(webview);
		if (!OS_MOBILEWEB) {
			$.barcodeWin.add(back);
		}

	}

}

/**
 * Closes the window
 * */
function closeWindow() {
	$.barcodeWin.close();
}

initialize();

