/*jslint maxerr:1000 */

/*
 * CommonJS convenience wrapper around jsPDF
 */
Ti.include(
	'/jsPDFMod/libs/sprintf.js',
	'/jsPDFMod/libs/base64.js'
);
Ti.include('/jsPDFMod/plugins/jspdf.js');
Ti.include('/jsPDFMod/plugins/jspdf.plugin.addimage.js');
Ti.include('/jsPDFMod/plugins/jspdf.plugin.save.js');

module.exports = jsPDF;        