/**
 * Screen Initialization
 * */
function initialize(){
	$.topBar.imageContainer.addEventListener('click',closeWindow);
	$.topBar.setTitle(L('pushNotification'));
}
var acs = require("/acs");

/**
 * EVENT LISTENER
 */

/**
 * Subscribe/Unsubscribe channels for sending push notifications
 */
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
	/**
	 * Unsubscribe from push channels
	 */
	function unsubscribe(){
		acs.unsubscribe({channel:"main", token:Ti.App.Properties.getString("deviceToken")});
	    acs.unsubscribe({channel:Ti.Platform.osname, token:Ti.App.Properties.getString("deviceToken")});
	    $.enablePushBtn.title = L("subscribe");
		$.enablePushBtn.removeEventListener("click",unsubscribe);
		$.enablePushBtn.addEventListener("click",enablePush);
	}
	
	function receivePush(e) {
	    alert(L('push_receive') + JSON.stringify(e));
	}
	
	/**
	 * Success Callback
	 */
	function deviceTokenSuccess(e) {
		
		Ti.App.Properties.setString("deviceToken", e.deviceToken);
	    acs.subscribe({channel:"main", token:e.deviceToken});
	    acs.subscribe({channel:Ti.Platform.osname, token:e.deviceToken});
	    $.enablePushBtn.title = L("unsubscribe");
		$.enablePushBtn.removeEventListener("click",enablePush);
		$.enablePushBtn.addEventListener("click",unsubscribe);
	}
	
	function deviceTokenError(e) {
	    alert(L('push_fail') + e.error);
	}




/**
 * Closes the window 
 * */
function closeWindow(){
	$.pushnotificationWin.close();
}

initialize();