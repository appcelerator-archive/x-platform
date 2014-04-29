/**
 * With this module, you can print images or PDFs. (You can call toImage() on most UI elements in Ti
 * to turn them in to images, therefore you can print just about anything with this module.)
 */

var AirPrint = require('ti.airprint');

var win = Ti.UI.createWindow({ backgroundColor: '#fff' });

if (!AirPrint.canPrint()) {
    win.add(Ti.UI.createLabel({ text: 'This version of iOS does not support AirPrint! Please upgrade.' }));
}
else {
    var pdf = 'http://assets.appcelerator.com.s3.amazonaws.com/docs/Appcelerator-IDC-Q1-2011-Mobile-Developer-Report.pdf';
    var fileName = pdf.split('/').pop();
    var pdfFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileName);

    function downloadPDF() {
        var progressBar = Ti.UI.createProgressBar({
            max: 1, min: 0, value: 0, visible: true,
            top: 20, right: 20, bottom: 20, left: 20
        });
        win.add(progressBar);
        var xhr = Ti.Network.createHTTPClient({
            ondatastream: function (e) {
                progressBar.value = e.progress;
            },
            onload: function () {
                pdfFile.write(this.responseData);
                win.remove(progressBar);
                showPrintButton();
            }
        });
        xhr.open('GET', pdf);
        xhr.send();
    }

    function showPrintButton() {
        var button = Ti.UI.createButton({
            title: 'Print Image',
            width: 100, height: 40,
            top: 10, right: 10
        });
        win.add(button);
        button.addEventListener('click', function () {
            AirPrint.print({
                url: pdfFile.nativePath,
                showsPageRange: true,
                view: button
            });
        });
    }

    if (pdfFile.exists()) {
        showPrintButton();
    }
    else {
        downloadPDF();
    }
}

win.open();