Ti.include(
    'query.js',
    'notify.js',
    'settings.js',
    'subscribe.js',
    'unsubscribe.js',
    'notifyTokens.js',
    'subscribeToken.js',
    'unsubscribeToken.js',
    'updateSubscription.js',
    'showChannels.js',
    'queryChannels.js',
    'setBadge.js',
    'resetBadge.js'
);

windowFunctions['Push Notifications'] = function () {
    var win = createWindow();
    var offset = addBackButton(win);

    var rows = [
        'Notify',
        'Notify Tokens',
        'Query Subscriptions',
        'Show Channels',
        'Query Channels',
        'Set Badge',
        'Reset Badge'
    ];
    if (Ti.Platform.name === 'iPhone OS' || Ti.Platform.name === 'android') {
        rows.push('Settings for This Device');
        rows.push('Subscribe');
        rows.push('Unsubscribe');
        rows.push('Subscribe Token');
        rows.push('Unsubscribe Token');
        rows.push('Update Subscription');
    }
    else {
        // Our other platforms do not support push notifications yet.
    }

    var table = Ti.UI.createTableView({
        backgroundColor: '#fff',
        top: offset + u,
        data: createRows(rows)
    });
    table.addEventListener('click', handleOpenWindow);
    win.add(table);
    win.open();
};

function receivePush(e) {
    alert('Received push: ' + JSON.stringify(e));
}

var androidPushModule = null;

var pushDeviceToken = null, pushNotificationsEnabled = null;
function enablePushNotifications() {
    pushNotificationsEnabled = true;
    Ti.App.Properties.setBool('PushNotifications-Enabled', true);
    checkPushNotifications();
}

function disablePushNotifications() {
    pushNotificationsEnabled = false;
    Ti.App.Properties.setBool('PushNotifications-Enabled', false);
    checkPushNotifications();
}

function getAndroidPushModule() {
    try {
        return require('ti.cloudpush')
    }
    catch (err) {
        alert('Unable to require the ti.cloudpush module for Android!');
        pushNotificationsEnabled = false;
        Ti.App.Properties.setBool('PushNotifications-Enabled', false);
        return null;
    }
}

function checkPushNotifications() {
    if (pushNotificationsEnabled === null) {
        pushNotificationsEnabled = Ti.App.Properties.getBool('PushNotifications-Enabled', false);
    }
    if (Ti.Platform.name === 'iPhone OS') {
        if (pushNotificationsEnabled) {
            if (Titanium.Platform.model == 'Simulator') {
                alert('The simulator does not support push!');
                disablePushNotifications();
                return;
            }
            Ti.Network.registerForPushNotifications({
                types: [
                    Ti.Network.NOTIFICATION_TYPE_BADGE,
                    Ti.Network.NOTIFICATION_TYPE_ALERT,
                    Ti.Network.NOTIFICATION_TYPE_SOUND
                ],
                success: deviceTokenSuccess,
                error: deviceTokenError,
                callback: receivePush
            });
        }
        else {
            Ti.Network.unregisterForPushNotifications();
            pushDeviceToken = null;
        }
    }
    else if (Ti.Platform.name === 'android') {
        if (androidPushModule === null) {
            androidPushModule = getAndroidPushModule();
            if (androidPushModule === null) {
                return;
            }
        }
        if (pushNotificationsEnabled) {
            // Need to retrieve the device token before enabling push
            androidPushModule.retrieveDeviceToken({
                success: deviceTokenSuccess,
                error: deviceTokenError
            });
        }
        else {
            androidPushModule.enabled = false;
            androidPushModule.removeEventListener('callback', receivePush);
            pushDeviceToken = null;
        }
    }
}

function deviceTokenSuccess(e) {
    pushDeviceToken = e.deviceToken;
    pushToken = pushDeviceToken; 
    alert('Device token is retrieved: ' + pushDeviceToken);
    Ti.API.info('Device Token: ' + pushDeviceToken);
    if (androidPushModule) {
        androidPushModule.enabled = true;
        androidPushModule.addEventListener('callback', receivePush);
    }
}

function deviceTokenError(e) {
    alert('Failed to register for push! ' + e.error);
    disablePushNotifications();
}

checkPushNotifications();