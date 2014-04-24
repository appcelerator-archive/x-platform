// Load the crypto modules
var Crypto = require('ti.crypto');

// This example demonstrates the usage of the single-shot crypto API
//
// The usage of the single-shot crypt APIs is as follows:
//
// 1. Create a key using the crypto.createKey API
// 2. Create an initialization vector using the Ti.createBuffer API (if needed -- the default is a zero-filled vector)
// 3. Create a cryptor using the crypto.createCryptor API
// 4. To encrypt:
//    a. Create a buffer containing the data to encrypt
//    b. Create a buffer to receive the encrypted data (optionally, use the input buffer to contain the encrypted data)
//    c. Call the encrypt method on the cryptor created in step 3
// 5. To decrypt:
//    a. Create a buffer containing the data to decrypt
//    b. Create a buffer to receive the unencrypted data (optionally, use the input buffer to contain the decrypted data)
//    c. Call the decrypt method on the cryptor created in step 4

//Crypto Key Size Options
//  KEYSIZE_AES128
//  KEYSIZE_AES192
//  KEYSIZE_AES256
//  KEYSIZE_DES
//  KEYSIZE_3DES
//  KEYSIZE_MINCAST
//  KEYSIZE_MAXCAST
//  KEYSIZE_MINRC4
//  KEYSIZE_MAXRC4
//  KEYSIZE_MINRC2
//  KEYSIZE_MINRC2

module.exports = (function() {
	var API = {
		params : null,
		cryptor : null,
		key : null,
		initializationVector : null,

		init : function(_keySize) {
			API.keySize = Crypto[_keySize];

			// Create a buffer of the specified size to hold the encryption/decryption key
			API.key = Ti.createBuffer({
				length : API.keySize
			});

			// For this example, create a key to use based on the key size for the selected algorithm
			// Keys can be defined using text strings ('value:') or hex values ('hexValue:')
			switch (API.keySize) {
				case 1:
					Crypto.encodeData({
						source : '11',
						dest : API.key,
						type : Crypto.TYPE_HEXSTRING
					});
					break;
				case 5:
					// Hex values can be separated by spaces for easier reading
					Crypto.encodeData({
						source : '00 11 22 33 44',
						dest : API.key,
						type : Crypto.TYPE_HEXSTRING
					});
					break;
				case 8:
					// Or, hex values can be specified as one single sequence of numbers
					Crypto.encodeData({
						source : '0011223344556677',
						dest : API.key,
						type : Crypto.TYPE_HEXSTRING
					});
					break;
				case 16:
					Crypto.encodeData({
						source : '001122334455667788990a0b0c0d0e0f',
						dest : API.key,
						type : Crypto.TYPE_HEXSTRING
					});
					break;
				case 24:
					API.key.value = 'abcdefghijklmnopqrstuvwx';
					break;
				case 32:
					API.key.value = 'abcdefghijklmnopqrstuvwxyz012345';
					break;
				case 128:
					API.key.value = '00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222';
					break;
				case 512:
					var string100 = '0000000000111111111122222222223333333333444444444455555555556666666666777777777788888888889999999999';
					API.key.value = string100 + string100 + string100 + string100 + string100 + '012345678901';
					break;
			};

			API.initializationVector = Ti.createBuffer({
				length : 16
			});
			var length = Crypto.encodeData({
				source : "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff",
				dest : API.initializationVector,
				type : Crypto.TYPE_HEXSTRING
			});

			API.cryptor = Crypto.createCryptor({
				algorithm : Crypto.ALGORITHM_AES128,
				options : Crypto.OPTION_PKCS7PADDING,
				key : API.key,
				initializationVector : API.initializationVector,
				resizeBuffer : true
			});
		},

		cleanup : function() {
			API.params = null;
			API.cryptor = null;
			API.key = null;
			API.initializationVector = null;
		},

		encrypt : function(e) {
			/**Commenting out as this code was not functional for Android**/
			// Create the buffer
			// var buffer = Ti.createBuffer({length:e.source.length});
			//
			// //Encode the source to the buffer
			// Crypto.encodeData({
			// source: e.source,
			// dest: buffer,
			// type: Crypto[e.type]
			// });
			/** Initializing buffer with value attribute in reference from ti.crypto module example method handleEncrypt**/
			var buffer = Ti.createBuffer({
				value : e.source
			});
			var numBytes = API.cryptor.encrypt(buffer);

			if (numBytes < 0) {
				alert('Error occurred during encryption: ' + numBytes);
			} else {
				if (e.type == "TYPE_BLOB") {
					return buffer;
				} else {
					return Crypto.decodeData({
						source : buffer,
						type : Crypto.TYPE_BASE64STRING
					});
				}

			}
		},

		decrypt : function(e) {
			// Load the buffer with the base64encoded value from the encrypted text field
			var buffer = Ti.createBuffer({
				length : e.source.length
			});
			var length = Crypto.encodeData({
				source : e.source,
				dest : buffer,
				type : Crypto[e.type]
			});
			if (length < 0) {
				Ti.API.info('ERROR: Buffer too small');
				return;
			}

			// For this example, use the same buffer for both input and output (in-place)
			// You can specify separate buffers for both input and output if desired
			var numBytes = API.cryptor.decrypt(buffer, length);

			if (numBytes < 0) {
				alert('Error occurred during encryption: ' + numBytes);
			} else {
				return buffer;
			}
		}
	};

	return API;
})();
