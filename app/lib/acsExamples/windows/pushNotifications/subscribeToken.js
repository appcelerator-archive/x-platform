windowFunctions['Subscribe Token'] = function (evt) {
    var win = createWindow();
    var offset = addBackButton(win);
    var content = Ti.UI.createScrollView({
        top: offset + u,
        contentHeight: 'auto',
        layout: 'vertical'
    });
    win.add(content);

    if (!pushDeviceToken) {
        content.add(Ti.UI.createLabel({
            text: 'Please visit Push Notifications > Settings to enable push!',
            textAlign: 'center',
            color: '#000',
            height: 'auto'
        }));
        win.open();
        return;
    }

    var channel = Ti.UI.createTextField({
        hintText: 'Channel',
        top: 10 + u, left: 10 + u, right: 10 + u,
        height: 40 + u,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false
    });
    content.add(channel);

    if ( Ti.Platform.name === 'android' ) {
        var android_type = Ti.UI.createTextField({
            hintText: 'android type',
            top: 10 + u, left: 10 + u, right: 10 + u,
            height: 40 + u,
            borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
            autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
            autocorrect: false
        });
        content.add(android_type);
    }

    var button = Ti.UI.createButton({
        title: 'Subscribe',
        top: 10 + u, left: 10 + u, right: 10 + u, bottom: 10 + u,
        height: 40 + u
    });
    content.add(button);

    var fields = [ channel ];

    function submitForm() {
        for (var i = 0; i < fields.length; i++) {
            if (!fields[i].value.length) {
                fields[i].focus();
                return;
            }
            fields[i].blur();
        }
        button.hide();

        var type = Ti.Platform.name;
        if ( Ti.Platform.name === 'android' ) {
            type = android_type.value;
        } else if ( Ti.Platform.name === 'iPhone OS' ) {
            type = 'ios';
        }

        Cloud.PushNotifications.subscribeToken({
            channel: channel.value,
            device_token: pushDeviceToken,
            type: type
        }, function (e) {
            if (e.success) {
                channel.value = '';
                alert('Subscribed! ' + pushDeviceToken);
            }
            else {
                error(e);
            }
            button.show();
        });
    }

    button.addEventListener('click', submitForm);
    for (var i = 0; i < fields.length; i++) {
        fields[i].addEventListener('return', submitForm);
    }

    win.addEventListener('open', function () {
        channel.focus();
    });
    win.open();
};