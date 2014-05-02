var Cloud = require("ti.cloud");

function createUser(_params){
	//http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.Cloud.Users
	Cloud.Users.create({
	    email: 'test@mycompany.com',
	    first_name: 'test_firstname',
	    last_name: 'test_lastname',
	    password: 'test_password',
	    password_confirmation: 'test_password'
	}, function (e) {
	    if (e.success) {
	        var user = e.users[0];
	        _params && _params.callback && _params.callback(user);
	    } else {
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};

function subscribe(_params){
	//http://docs.appcelerator.com/cloud/latest/#!/api/PushNotifications-method-subscribe_token
	if(_params && _params.token){

		Cloud.PushNotifications.subscribeToken({
		    channel: _params.channel || 'main',
		    device_token: _params.token,
		    type:OS_IOS?"ios":"android"
		}, function (e) {
		    if (e.success) {
		        alert(L('sub_success')+(_params.channel || "main")+ L('channel'));
		    } else {
		        alert('Error:\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
		});
	}
};

function unsubscribe(_params){
	//http://docs.appcelerator.com/cloud/latest/#!/api/PushNotifications-method-unsubscribe_token
	if(_params && _params.token){

		Cloud.PushNotifications.unsubscribeToken({
		    channel: _params.channel || 'main',
		    device_token: _params.token
		}, function (e) {
		    if (e.success) {
		        alert(L('sub_failure') +(_params.channel || 'main')+ L('channel'));
		    } else {
		        alert(L('error') +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
		});
	}
};


exports.createUser = createUser;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;