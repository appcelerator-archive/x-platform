//Source Reference: https://github.com/Core-13/jsPDF-image-support
var _jsPDF = require('/jsPDFMod/TiJSPDF');

function open() {
	var _tempFile = null;
    var win = Ti.UI.createWindow({
        backgroundColor: '#eee',
        height: Ti.UI.FILL,
        layout: 'vertical',
        title: 'jsPDF Sample',
        width: Ti.UI.FILL
    });

	var label = Ti.UI.createLabel({
        color: '#000',
        height: Ti.UI.SIZE,
        left: 10,
        right: 10,
		text: 'Press the below button to demonstrate how to use jsPDF in Titanium. If you are using Android you will need to run this on the device to view the PDF.',
        top: 10,
        width: Ti.UI.FILL
	});
	win.add(label);
	
    var btn = Ti.UI.createButton({
        font: {
            fontSize: 14
        },
        height: 50,
        title: 'Run PDF Sample',
        left: 20,
        right: 20,
        top: 40,
        width: Ti.UI.FILL
    });
    win.add(btn);
    
    var close = Ti.UI.createButton({
        font: {
            fontSize: 14
        },
        height: 50,
        title: 'Close Window',
        left: 20,
        right: 20,
        top: 20,
        width: Ti.UI.FILL
    });
    win.add(close);
    
    btn.addEventListener('click', function (e) {
        var doc = new _jsPDF();
        doc.setProperties({
            title: 'Title',
            subject: 'This is the subject',		
            author: 'John Doe',
            keywords: 'one, two, three',
            creator: 'Someone'
        });

        var imgSample1 = Ti.Filesystem.resourcesDirectory + 'image1.jpg';
        doc.addImage(imgSample1, 'JPEG', 10, 20, 128, 96);

        doc.setFont("helvetica");
        doc.setFontType("bold");
        doc.setFontSize(24);
        doc.text(20, 180, 'Hello world');
        doc.text(20, 190, 'This is jsPDF with image support\nusing Titanium..');

        doc.addPage();
        doc.rect(20, 120, 10, 10); // empty square
        doc.rect(40, 120, 10, 10, 'F'); // filled square

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
				subject : "PDF Attached",
				toRecipients : ['foo@yahoo.com']
			});
		emailDialog.addAttachment(_tempFile);
		emailDialog.open();
		
			
		
// 				
		// if (OS_ANDROID) {
			// var intent = Ti.Android.createIntent({
				// action: Ti.Android.ACTION_VIEW,
				// type: "application/pdf",
				// data: _tempFile.nativePath
			// });
// 			
			// try {
				// Ti.Android.currentActivity.startActivity(intent);
			// } catch(e) {
				// Ti.API.debug(e);
				// alert('You have no apps on your device that can open PDFs. Please download one from the marketplace.');
			// }
		// } else {
// 
            // var winPDF = Ti.UI.createWindow({
                // backgroundColor: '#eee',
                // height: Ti.UI.FILL,
                // title: 'PDF Preview',
                // width: Ti.UI.FILL
            // });
            // var btnClose = Ti.UI.createButton({
                // title: 'Close'
            // });
            // btnClose.addEventListener('click', function (e) {
                // winPDF.close();
            // });
            // winPDF.setRightNavButton(btnClose);
            // var pdfview = Ti.UI.createWebView({
                // backgroundColor: '#eee',
                // url: _tempFile.nativePath,
                // height: Ti.UI.FILL,
                // width: Ti.UI.FILL
            // });
            // winPDF.add(pdfview);
            // winPDF.open({ modal:true });
		// }
//       
    });
    close.addEventListener("click",function(){
    	win.close();
    });
    win.addEventListener('close',function (e) {
 		if (_tempFile != null) {
			_tempFile.deleteFile();
		}
    });
    
	win.open({modal:true});
};

module.exports = open;