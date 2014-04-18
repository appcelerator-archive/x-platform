/** @preserve 
jsPDF addImage plugin (JPEG only at this time)
Copyright (c) 2012 https://github.com/siefkenj/
*/

/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(jsPDFAPI) {
'use strict'

    jsPDFAPI.save = function (file) {
        'use strict'
        
        if(file.exists()){
        	file.deleteFile();
        }
        var res = this.output();
        var parts = res.split(/#image\s([^#]*)#/gim);
        
        var intNode = 0, intNodes = parts.length, imgFile;
        for (intNode = 0; intNode < intNodes; intNode = intNode + 1) {
            switch (intNode % 2 ? false : true) {
            case true:
                file.write(parts[intNode],true);
                break;
            case false:
                imgFile = Ti.Filesystem.getFile(parts[intNode]);
                if(imgFile.exists()){
                	file.write(imgFile.read(),true);              	
                }
                break;  
            }
        }

        //Ti.API.info('save2', res.length);
        return this
    };
    
})(jsPDF.API);

;(function(jsPDFAPI) {
'use strict'

    jsPDFAPI.test = function () {
        'use strict'
        
        this.addPage();
        return this
    };
    
})(jsPDF.API);