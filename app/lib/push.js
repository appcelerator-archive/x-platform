/*Push Notification Guides & Links
 * http://docs.appcelerator.com/titanium/latest/#!/guide/Push_Notifications
 * http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.CloudPush
*/

var acs = require("/acs");

function open(){
	
	var win = Ti.UI.createWindow({
	    layout: 'vertical',
	    backgroundColor: 'white',
	    modal:true
	});
	
	var back = Ti.UI.createButton({
	    title: 'Back',
	    top:20,
	    left:10
	});
	
	win.add(back);
	
	back.addEventListener("click", function(){
		win.close();
	});
	
	var enablePushBtn = Ti.UI.createButton({
	    title: 'Enable Push Notifications',
	    top:40,
	    width:Ti.UI.FILL
	});
	
	win.add(enablePushBtn);
	
	enablePushBtn.addEventListener("click",enablePush);
	
	win.open();
	
	function enablePush() {
		//http://docs.appcelerator.com/titanium/latest/#!#!/guide/Push_Notifications
		if(OS_IOS){
			Ti.Network.registerForPushNotifications({
			    // Specifies which notifications to receive
			    types: [
			        Ti.Network.NOTIFICATION_TYPE_BADGE,
			        Ti.Network.NOTIFICATION_TYPE_ALERT,
			        Ti.Network.NOTIFICATION_TYPE_SOUND
			    ],
			    success: deviceTokenSuccess,
			    error: deviceTokenError,
			    callback: receivePush
			});
			// Process incoming push notifications
			
		} else {
			//http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.CloudPush
			var CloudPush = require('ti.cloudpush');
			
			CloudPush.enabled = true;
			
			CloudPush.retrieveDeviceToken({
			    success: deviceTokenSuccess,
			    error: deviceTokenError
			});
			
			CloudPush.addEventListener('callback', receivePush);
			
			CloudPush.addEventListener('trayClickLaunchedApp', function (evt) {
			    Ti.API.info('Tray Click Launched App (app was not running)');
			});
			
			CloudPush.addEventListener('trayClickFocusedApp', function (evt) {
			    Ti.API.info('Tray Click Focused App (app was already running)');
			});
			
		}
	}
	
	function unsubscribe(){
		acs.unsubscribe({channel:"main", token:Ti.App.Properties.getString("deviceToken")});
	    acs.unsubscribe({channel:Ti.Platform.osname, token:Ti.App.Properties.getString("deviceToken")});
	    enablePushBtn.title = "Subscribe to Channels";
		enablePushBtn.removeEventListener("click",unsubscribe);
		enablePushBtn.addEventListener("click",enablePush);
	}
	
	function receivePush(e) {
	    alert('Received push: ' + JSON.stringify(e));
	}
	
	function deviceTokenSuccess(e) {
		
		Ti.App.Properties.setString("deviceToken", e.deviceToken);
	    acs.subscribe({channel:"main", token:e.deviceToken});
	    acs.subscribe({channel:Ti.Platform.osname, token:e.deviceToken});
	    enablePushBtn.title = "Unsubscribe from Channels";
		enablePushBtn.removeEventListener("click",enablePush);
		enablePushBtn.addEventListener("click",unsubscribe);
	}
	
	function deviceTokenError(e) {
	    alert('Failed to register for push notifications! ' + e.error);
	}
}

module.exports = open;