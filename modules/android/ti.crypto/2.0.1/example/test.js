/*
 This file runs through all of the supported algorithms to test if they are functioning properly.
 */

function testEncodeDecode(type, encodedString, rawData) {

    // First turn the encoded string in to the raw data.
    var encodeBuffer = Ti.createBuffer({ length:rawData.length });
    Crypto.encodeData({
        source:encodedString,
        dest:encodeBuffer,
        type:type
    });
    var actualRawData = encodeBuffer.toString();
    if (rawData == actualRawData) {
        Ti.API.info('ENCODE PASS (' +
            'type: ' + type + ', ' +
            'input: ' + (encodedString || '{ empty string }') + ', ' +
            'out: ' + (actualRawData || '{ empty string }') + ')'
        );
    } else {
        Ti.API.error('ENCODE FAIL (' +
            'type: ' + type + ', ' +
            'input: ' + (encodedString || '{ empty string }') + ', ' +
            'expected: ' + (rawData || '{ empty string }') + ', ' +
            'actual: ' + (actualRawData || '{ empty string }') + ')'
        );
    }

    // Now try doing the opposite, turn the raw data in to an encoded string.
    var actualEncodedString = Crypto.decodeData({
        source:Ti.createBuffer({ value:rawData }),
        type:type
    });
    if (encodedString == actualEncodedString) {
        Ti.API.info('DECODE PASS (' +
            'type: ' + type + ', ' +
            'input: ' + (rawData || '{ empty string }') + ', ' +
            'out: ' + (actualEncodedString || '{ empty string }') + ')'
        );
    } else {
        Ti.API.error('DECODE FAIL (' +
            'type: ' + type + ', ' +
            'input: ' + (rawData || '{ empty string }') + ', ' +
            'expected: ' + (encodedString || '{ empty string }') + ', ' +
            'actual: ' + (actualEncodedString || '{ empty string }') + ')'
        );
    }
}

testEncodeDecode(Crypto.TYPE_HEXSTRING, '68656c6c6f', 'hello');
testEncodeDecode(Crypto.TYPE_HEXSTRING, '676f6f64627965', 'goodbye');
testEncodeDecode(Crypto.TYPE_BASE64STRING, 'dGVzdCBiYXNlIDY0IGVuY29kaW5n', 'test base 64 encoding');

function testSingle(params) {
    var cryptor = Crypto.createCryptor({
        algorithm:params.algorithm,
        options:params.options,
        key:createKey(params),
        initializationVector:createIV()
    });
    var encryptBuffer = Ti.createBuffer({ value:params.single });
    var encryptBytes = cryptor.encrypt(encryptBuffer);
    if (encryptBytes < 0) {
        Ti.API.error('FAIL ' + params.id + ' (' +
            'type: single, direction: encrypt,' +
            'input: ' + (params.single || '{ empty string }') + ', ' +
            'numBytes: ' + encryptBytes + ')'
        );
        return;
    }

    var actualEncrypted = Crypto.decodeData({
        source:encryptBuffer,
        type:Crypto.TYPE_BASE64STRING
    });
    if (actualEncrypted != params.singleEncrypted) {
        Ti.API.error('FAIL ' + params.id + ' (' +
            'type: single, direction: encrypt, ' +
            'input: ' + (params.single || '{ empty string }') + ', ' +
            'expect: ' + (params.singleEncrypted || '{ empty string }') + ', ' +
            'actual: ' + (actualEncrypted || '{ empty string }') + ')'
        );
        return;
    }
    Ti.API.info('PASS ' + params.id + ' (type: single, direction: encrypt)');

    var decryptBuffer = Ti.createBuffer({ length:params.singleEncrypted.length });
    var decryptLength = Crypto.encodeData({
        source:params.singleEncrypted,
        dest:decryptBuffer,
        type:Crypto.TYPE_BASE64STRING
    });
    if (decryptLength < 0) {
        Ti.API.error('FAIL ' + params.id + ' (' +
            'type: single, direction: decrypt, ' +
            'reason: buffer size too small)'
        );
        return;
    }

    var decryptBytes = cryptor.decrypt(decryptBuffer, decryptLength);
    if (decryptBytes < 0) {
        Ti.API.error('FAIL ' + params.id + ' (' +
            'type: single, direction: decrypt,' +
            'input: ' + (params.single || '{ empty string }') + ', ' +
            'numBytes: ' + decryptBytes + ')'
        );
        return;
    }

    var actualDecrypted = decryptBuffer.toString();
    if (actualDecrypted != params.single) {
        Ti.API.error('FAIL ' + params.id + ' (' +
            'type: single, direction: encrypt, ' +
            'input: ' + (params.singleEncrypted || '{ empty string }') + ', ' +
            'expect: ' + (params.single || '{ empty string }') + ', ' +
            'actual: ' + (actualDecrypted || '{ empty string }') + ')'
        );
        return;
    }
    Ti.API.info('PASS ' + params.id + ' (type: single, direction: decrypt)');
}

function testMultiple(params) {
    var cryptor = Crypto.createCryptor({
        algorithm:params.algorithm,
        options:params.options,
        key:createKey(params),
        initializationVector:createIV()
    });

    var fixedBuffer = Ti.createBuffer({ length:1024 });
    var encryptionBuffer = Ti.createBuffer();
    cryptor.resizeBuffer = false;

    // Update the encryption several times, checking our progress each time.
    for (var i = 0; i < params.multiple.length; i++) {
        cryptor.operation = Crypto.ENCRYPT;
        cryptor.resizeBuffer = false;

        var buffer = Ti.createBuffer({ value:params.multiple[i] + '\n' });
        var numBytes = cryptor.update(buffer, -1, fixedBuffer);
        if (numBytes < 0) {
            Ti.API.error('FAIL ' + params.id + ' (' +
                'type: multiple, direction: encrypt pass ' + (i + 1) + ',' +
                'input: ' + (params.multiple[i] || '{ empty string }') + ', ' +
                'numBytes: ' + numBytes + ')'
            );
            return;
        }

        encryptionBuffer.append(fixedBuffer, 0, numBytes);
        var actualEncrypted = Crypto.decodeData({
            source:encryptionBuffer,
            type:Crypto.TYPE_BASE64STRING
        });
        if (actualEncrypted != params.multipleEncrypted[i]) {
            Ti.API.error('FAIL ' + params.id + ' (' +
                '\n\ttype: multiple, direction: encrypt pass ' + (i + 1) + ',' +
                '\n\tinput: ' + (params.multiple[i] || '{ empty string }') + ', ' +
                '\n\texpect: ' + (params.multipleEncrypted[i] || '{ empty string }') + ', ' +
                '\n\tactual: ' + (actualEncrypted || '{ empty string }') + '\n)'
            );
            return;
        }
        Ti.API.info('PASS ' + params.id + ' (type: multiple, direction: encrypt pass ' + (i + 1) + ')');
    }

    // Now finalize the encryption, and check our end product.
    cryptor.resizeBuffer = false;
    numBytes = cryptor.finish(fixedBuffer);
    if (numBytes > 0) {
        // Append the result to our encryption buffer
        encryptionBuffer.append(fixedBuffer, 0, numBytes);
        Crypto.decodeData({
            source:encryptionBuffer,
            type:Crypto.TYPE_BASE64STRING
        });
    }
    cryptor.release();
    cryptor.operation = Crypto.DECRYPT;
    cryptor.resizeBuffer = true;
    var decryptionBuffer = Ti.createBuffer();
    var decryptedText = Ti.createBuffer();
    numBytes = cryptor.update(encryptionBuffer, -1, decryptionBuffer);
    if (numBytes > 0) {
        decryptedText.append(decryptionBuffer, 0, numBytes);
    }
    numBytes = cryptor.finish(decryptionBuffer);
    if (numBytes > 0) {
        decryptedText.append(decryptionBuffer, 0, numBytes);
    }
    cryptor.release();

    var actualDecrypted = decryptedText.toString();
    var expectedDecrypted = params.multiple.join('\n') + '\n';
    if (actualDecrypted != expectedDecrypted) {
        Ti.API.error('FAIL ' + params.id + ' (' +
            '\n\ttype: multiple, direction: decrypt, ' +
            '\n\tinput: ' + (params.multipleEncrypted.join('') || '{ empty string }') + ', ' +
            '\n\texpect: ' + (expectedDecrypted || '{ empty string }') + ', ' +
            '\n\tactual: ' + (actualDecrypted || '{ empty string }') + '\n)'
        );
        return;
    }
    Ti.API.info('PASS ' + params.id + ' (type: multiple, direction: decrypt)');

    encryptionBuffer.clear();
    encryptionBuffer.release();
}

function testAlgorithm(params) {
    testSingle(params);
    testMultiple(params);
}

function createKey(params) {
    var key = Ti.createBuffer({ length:params.keySize });
    switch (params.keySize) {
        case 1:
            Crypto.encodeData({
                source:'11',
                dest:key,
                type:Crypto.TYPE_HEXSTRING
            });
            break;
        case 5:
            // Hex values can be separated by spaces for easier reading
            Crypto.encodeData({
                source:'00 11 22 33 44',
                dest:key,
                type:Crypto.TYPE_HEXSTRING
            });
            break;
        case 8:
            // Or, hex values can be specified as one single sequence of numbers
            Crypto.encodeData({
                source:'0011223344556677',
                dest:key,
                type:Crypto.TYPE_HEXSTRING
            });
            break;
        case 16:
            Crypto.encodeData({
                source:'001122334455667788990a0b0c0d0e0f',
                dest:key,
                type:Crypto.TYPE_HEXSTRING
            });
            break;
        case 24:
            key.length = Ti.Codec.encodeString({
                source:'abcdefghijklmnopqrstuvwx',
                dest:key
            });
            break;
        case 32:
            key.length = Ti.Codec.encodeString({
                source:'abcdefghijklmnopqrstuvwxyz012345',
                dest:key
            });
            break;
        case 128:
            key.length = Ti.Codec.encodeString({
                source:'00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222',
                dest:key
            });
            break;
        case 512:
            var string100 = '0000000000111111111122222222223333333333444444444455555555556666666666777777777788888888889999999999';
            key.length = Ti.Codec.encodeString({
                source:string100 + string100 + string100 + string100 + string100 + '012345678901',
                dest:key
            });
            break;
    }
    return key;
}

/**
 * Creates a very long potential initialization vector.
 */
function createIV() {
    // Create a source string with 512 hex values in it.
    var source = '00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff ';
    for (var i = 0; i <= 4; i++) {
        source += source;
    }
    // Encode this in to a buffer.
    var iv = Ti.createBuffer({ length:source.length });
    Crypto.encodeData({
        source:source,
        dest:iv,
        type:Crypto.TYPE_HEXSTRING
    });
    return iv;
}

testAlgorithm({
    id:'AES-128x128',
    keySize:Crypto.KEYSIZE_AES128,
    algorithm:Crypto.ALGORITHM_AES128,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'bs9V7YCfwsqGb8yWgXFlxMO1lKgLkT67QH1C0v7tptI=',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['bs9V7YCfwsqGb8yWgXFlxA==', 'bs9V7YCfwsqGb8yWgXFlxHHjs+vAr9M6fNOdCkqM1ncMZk/TGy8I3+I0hABSZA6W']
});
testAlgorithm({
    id:'AES-128x192',
    keySize:Crypto.KEYSIZE_AES192,
    algorithm:Crypto.ALGORITHM_AES128,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'zg1roxYoOldTsqPWQwYl9Cgs7am8XFhXQnVc7DFOtn0=',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['zg1roxYoOldTsqPWQwYl9A==', 'zg1roxYoOldTsqPWQwYl9PMBpOSQwGVSWgO3+3rJsENB8X2mAJjYrit8qdnSzSyc']
});
testAlgorithm({
    id:'AES-128x256',
    keySize:Crypto.KEYSIZE_AES256,
    algorithm:Crypto.ALGORITHM_AES128,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'F+T1hiFZ/kPUoV/mgjgG+IwYUPIDVNjGMj7aRJyCkPA=',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['F+T1hiFZ/kPUoV/mgjgG+A==', 'F+T1hiFZ/kPUoV/mgjgG+Hu2DY3rADmvziUN6h3JTEeUYDzSJeWUkaq3DhyCeV3x']
});
testAlgorithm({
    id:'DES',
    keySize:Crypto.KEYSIZE_DES,
    algorithm:Crypto.ALGORITHM_DES,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'y3us11esIROyTLEESbj4aEj2wr9ZeiMl',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['y3us11esIROyTLEESbj4aA==', 'y3us11esIROyTLEESbj4aEt5jl5l5BHVchhZgsoctxHkQzqX7exH8AxyJTmE1oD+']
});
testAlgorithm({
    id:'3DES',
    keySize:Crypto.KEYSIZE_3DES,
    algorithm:Crypto.ALGORITHM_3DES,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'IvGj6dnEgyVoXg+qceIZ3zAWsIUQT+EV',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['IvGj6dnEgyVoXg+qceIZ3w==', 'IvGj6dnEgyVoXg+qceIZ3xUaADlPfaljuXD+BUrT2ykzAWu7WN9BkbEekd7/JmsI']
});
testAlgorithm({
    id:'CASTxMin',
    keySize:Crypto.KEYSIZE_MINCAST,
    algorithm:Crypto.ALGORITHM_CAST,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'CZgCdtLVQnlOsny4jB7sV1IZAET4acbB',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['CZgCdtLVQnlOsny4jB7sVw==', 'CZgCdtLVQnlOsny4jB7sV2PrYv8rRT+DFOyIpJYRdY5mMVVfkdDE8ohvPcifZW2k']
});
testAlgorithm({
    id:'CASTxMax',
    keySize:Crypto.KEYSIZE_MAXCAST,
    algorithm:Crypto.ALGORITHM_CAST,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'mDE3JSbiU23waTsxx9kckal4X5vaoMbU',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['mDE3JSbiU23waTsxx9kckQ==', 'mDE3JSbiU23waTsxx9kckdl7GxxbS2/VXEfINeedqnA0DOkiptv51PFWOxM/mc57']
});
/*testAlgorithm({
 id: 'RC4xMin',
 keySize: Crypto.KEYSIZE_MINRC4,
 algorithm: Crypto.ALGORITHM_RC4,
 options: 0,
 single: 'Titanium Crypto Module',
 singleEncrypted: '2OJ7dhKf8y4BGYRwAEsEoGWRezaP+A==',
 multiple: ['Titanium Crypto Module', 'Some additional text'],
 multipleEncrypted: ['2OJ7dhKf8y4BGYRwAEsEoGWRezaP+Mo=', '2OJ7dhKf8y4BGYRwAEsEoGWRezaP+Mqwy4D1U+pQMthsLFSMDc05DfsJGxk=']
 });
 testAlgorithm({
 id: 'RC4xMax',
 keySize: Crypto.KEYSIZE_MAXRC4,
 algorithm: Crypto.ALGORITHM_RC4,
 options: 0,
 single: 'Titanium Crypto Module',
 singleEncrypted: '2QxGqhBr3+MEiTCNsCGJPezN6KeZWA==',
 multiple: ['Titanium Crypto Module', 'Some additional text'],
 multipleEncrypted: ['2QxGqhBr3+MEiTCNsCGJPezN6KeZWEw=', '2QxGqhBr3+MEiTCNsCGJPezN6KeZWEwXPY4X7uUrb5WK9AdGjYCOAE6vCNg=']
 });*/
testAlgorithm({
    id:'RC2xMin',
    keySize:Crypto.KEYSIZE_MINRC2,
    algorithm:Crypto.ALGORITHM_RC2,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'w1ejze0JvLKj30jwpdPJmMkazwafHLNx',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['w1ejze0JvLKj30jwpdPJmA==', 'w1ejze0JvLKj30jwpdPJmMOEkjc4TrZanvZarN5HxmsjliftQOa/X/r/z3VtFH2Q']
});
testAlgorithm({
    id:'RC2xMax',
    keySize:Crypto.KEYSIZE_MAXRC2,
    algorithm:Crypto.ALGORITHM_RC2,
    options:Crypto.OPTION_PKCS7PADDING,
    single:'Titanium Crypto Module',
    singleEncrypted:'WNaIeDZqUTMPdlHm35r3U9edb3vjaKOs',
    multiple:['Titanium Crypto Module', 'Some additional text to encrypt'],
    multipleEncrypted:['WNaIeDZqUTMPdlHm35r3Uw==', 'WNaIeDZqUTMPdlHm35r3U9R50OumHt987wOrM7GuNVJ+m9+ZR/03jngU6vPygXrR']
});