/**
 * Initializaion Parameters
 */
var _jsPDF = require('/jsPDFMod/TiJSPDF');
var _tempFile = null;

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('generatePdf'));
}

/**
 * EVENT LISTENER
 */

/**
 * generate a sample pdf and attaches the same in email to send
 */
function generatePDF(e) {
	var doc = new _jsPDF();
	doc.setProperties({
		title : L('pdf_title'),
		subject : L('pdf_subject'),
		author : L('pdf_author'),
		keywords : L('pdf_keywords'),
		creator : L('pdf_creator')
	});

	var imgSample1 = Ti.Filesystem.resourcesDirectory + 'image1.jpg';
	doc.addImage(imgSample1, 'JPEG', 10, 20, 128, 96);

	doc.setFont("helvetica");
	doc.setFontType("bold");
	doc.setFontSize(24);
	doc.text(20, 180, 'Hello world');
	doc.text(20, 190, 'This is jsPDF with image support\nusing Titanium..');

	doc.addPage();
	doc.rect(20, 120, 10, 10);
	// empty square
	doc.rect(40, 120, 10, 10, 'F');
	// filled square

	var imgSample2 = Ti.Filesystem.resourcesDirectory + 'image2.jpg';
	doc.addImage(imgSample2, 'JPEG', 70, 10, 100, 120);

	doc.setFont("helvetica");
	doc.setFontType("normal");
	doc.setFontSize(24);
	doc.text(20, 180, 'This is what I looked like trying to get');
	doc.text(20, 190, 'the save function into the plugin system.');
	doc.text(20, 200, 'It works now');

	doc.text(20, 240, (new Date()).toString());

	var timeStampName = new Date().getTime();
	if (_tempFile != null) {
		_tempFile.deleteFile();
	}
	_tempFile = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory(), timeStampName + '.pdf');
	doc.save(_tempFile);

	var emailDialog = Ti.UI.createEmailDialog({
		subject : L('pdf_attached'),
		toRecipients : ['foo@yahoo.com']
	});
	emailDialog.addAttachment(_tempFile);
	emailDialog.open();
}

/**
 * Closes the window
 * */
function closeWindow() {
	//destroying the temp file created
	if (_tempFile != null) {
		_tempFile.deleteFile();
	}
	$.jspdfWin.close();
}

initialize();
