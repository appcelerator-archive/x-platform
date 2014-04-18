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

App.controllers.cryptoSingle = function () {
	var API = {
		params: null,
		cryptor: null,
		key: null,
		initializationVector: null,
		plainTextField: null,
		cipherTextField: null,
		
		init: function (params) {
			API.params = params;
			
			// Create a buffer of the specified size to hold the encryption/decryption key
			API.key = Ti.createBuffer({ length: params.keySize });

			// For this example, create a key to use based on the key size for the selected algorithm
			// Keys can be defined using text strings ('value:') or hex values ('hexValue:')
			switch (params.keySize) {
				case 1:
					Crypto.encodeData({
						source: '11',
						dest: API.key,
						type: Crypto.TYPE_HEXSTRING
					});
					break;
				case 5:
					// Hex values can be separated by spaces for easier reading
				    Crypto.encodeData({
						source: '00 11 22 33 44',
						dest: API.key,
						type: Crypto.TYPE_HEXSTRING
					});
					break;
				case 8:
					// Or, hex values can be specified as one single sequence of numbers
					Crypto.encodeData({
						source: '0011223344556677',
						dest: API.key,
						type: Crypto.TYPE_HEXSTRING
					});
					break;
				case 16:
					Crypto.encodeData({
						source: '001122334455667788990a0b0c0d0e0f',
						dest: API.key,
						type: Crypto.TYPE_HEXSTRING
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
			
			API.initializationVector = Ti.createBuffer({ length: 16 });
			var length = Crypto.encodeData({
				source: "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff",
				dest: API.initializationVector,
				type: Crypto.TYPE_HEXSTRING
			});
			
			API.cryptor = Crypto.createCryptor({
				algorithm: params.algorithm,
				options: params.options,
				key: API.key,
				initializationVector: API.initializationVector
			});
		},
		
		cleanup: function() {
			API.params = null;
			API.cryptor = null;
			API.key = null;
			API.initializationVector = null;
			API.plainTextField = null;
			API.cipherTextField = null;
		},
		
		handleEncrypt: function(e) {
			// Create the buffer containing the original plain text that we want to encrypt
			var buffer = Ti.createBuffer({ value: API.plainTextField.value });
		
			// For this example, use the same buffer for both input and output (in-place)
			// You can specify separate buffers for both input and output if desired
			var numBytes = API.cryptor.encrypt(buffer);
			
			if (numBytes < 0) {
				alert('Error occurred during encryption: ' + numBytes);
			} else {
				// Set the value of the encrypted text (base64 encoded for readability)
				API.cipherTextField.value = Crypto.decodeData({
					source: buffer,
					type: Crypto.TYPE_BASE64STRING
				});
			}
			
			API.plainTextField.blur();
		},
	
		handleDecrypt: function(e) {
			// Load the buffer with the base64encoded value from the encrypted text field
			var buffer = Ti.createBuffer({ length: API.cipherTextField.value.length });
			var length = Crypto.encodeData({
				source: API.cipherTextField.value,
				dest: buffer,
				type: Crypto.TYPE_BASE64STRING
			});		
			if (length < 0) {
				Ti.API.info('ERROR: Buffer too small');
				return;
			}
				
			// For this example, use the same buffer for both input and output (in-place)
			// You can specify separate buffers for both input and output if desired
			var numBytes = API.cryptor.decrypt(buffer,length);
			
			if (numBytes < 0) {
				alert('Error occurred during encryption: ' + numBytes);
			} else {
				Ti.UI.createAlertDialog({
					title: 'Decrypted Text',
					message: buffer.toString(),
					buttonNames: ['OK']
				}).show();
			}
		},
		
		create: function(win) {
			win.title = API.params.title + ' - Single';
			
			win.add(Ti.UI.createLabel({
				text: 'Enter text to encrypt',
				textAlign: 'left',
				top: 10,
				left: 10,
				color: 'black',
				width: Ti.UI.SIZE || 'auto',
				height: Ti.UI.SIZE || 'auto'
			}));
			
			API.plainTextField = Ti.UI.createTextArea({
				value: 'Titanium Crypto Module',
				color: 'black',
				left: 10, right: 10, top: 4, height: 100,
				borderColor: 'gray',
				borderRadius: 8,
				borderWidth: 1,
				font: { fontSize: 14 }
			});
			win.add(API.plainTextField);
			
			var encryptBtn = Ti.UI.createButton({
				title: 'Encrypt',
				top: 10,
				width: 200,
				height: 40
			});
			win.add(encryptBtn);
			
			win.add(Ti.UI.createLabel({
				text: 'Encrypted text (base64 encoded)',
				textAlign: 'left',
				top: 10,
				left: 10,
				color: 'black',
				width: Ti.UI.SIZE || 'auto',
				height: Ti.UI.SIZE || 'auto'
			}));
			
			API.cipherTextField = Ti.UI.createTextArea({
				backgroundColor: '#F0F0F0',
				editable: false,
				color: 'black',
				left: 10, right: 10, top: 14, height: 100,
				borderColor: 'gray',
				borderRadius: 8,
				borderWidth: 1,
				font: { fontSize: 14 }
			});
			win.add(API.cipherTextField);
			
			var decryptBtn = Ti.UI.createButton({
				title: 'Decrypt',
				top: 10,
				width: 200,
				height: 40
			});
			win.add(decryptBtn);
			
			encryptBtn.addEventListener('click', API.handleEncrypt);
			decryptBtn.addEventListener('click', API.handleDecrypt);
		}
	};
	
	return API;
}