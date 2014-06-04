var Cloud = require('ti.cloud');

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('acs_user'));
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.acsuserWin.close();
}

/**
 * Animate the create user form
 * */
function openCreateView(e) {
	$.userView.visible = true;
	var height = $.userView.height === 1 ? Ti.UI.SIZE : 1;
	$.userView.animate(Ti.UI.createAnimation({
		height : height,
		duration : 200
	}), function() {
		$.userView.height = height;
		$.userView.visible = $.userView.height === 1 ? false : true;
	});
}

/**
 * Animat ethe Login Form
 * */
function openLoginView(e) {
	$.loginView.visible = true;
	var height = $.loginView.height === 1 ? Ti.UI.SIZE : 1;
	$.loginView.animate({
		height : height,
		duration : 200
	}, function() {
		$.loginView.height = height;
		$.loginView.visible = $.loginView.height === 1 ? false : true;
	});
}

/**
 * Creates user on cloud
 * */
function submitForm() {
	var fields = [$.userNameVal, $.passwordVal, $.cnfpasswordVal, $.firstNameVal, $.lastNameVal];
	for (var i = 0; i < fields.length; i++) {
		if (!fields[i].value.length) {
			fields[i].focus();
			return;
		}
		fields[i].blur();
	}
	if ($.passwordVal.value != $.cnfpasswordVal.value) {
		alert(L('password_not_matched'));
		$.cnfpasswordVal.focus();
		return;
	}
	//http://docs.appcelerator.com/platform/latest/#!/api/Titanium.Cloud.Users-method-create
	Cloud.Users.create({
		username : $.userNameVal.value,
		password : $.passwordVal.value,
		password_confirmation : $.cnfpasswordVal.value,
		first_name : $.firstNameVal.value,
		last_name : $.lastNameVal.value,
		email : $.emailVal.value
	}, function(e) {
		if (e.success) {
			var user = e.users[0];
			alert(L('created_logged_in_as') + ' ' + user.id);
			$.userNameVal.value = $.passwordVal.value = $.cnfpasswordVal.value = $.firstNameVal.value = $.lastNameVal.value = $.emailVal.value = '';
		} else {
			alert('error:'+JSON.stringify(e));
		}
	});
}

/**
 * User Login using cloud
 * */
function loginUser() {
        var fields = [ $.lusernameVal, $.lpasswordVal ];
        for (var i = 0; i < fields.length; i++) {
            if (!fields[i].value.length) {
                fields[i].focus();
                return;
            }
            fields[i].blur();
        }
        //http://docs.appcelerator.com/platform/latest/#!/api/Titanium.Cloud.Users-method-login
        Cloud.Users.login({
            login: $.lusernameVal.value,
            password: $.lpasswordVal.value
        }, function (e) {
            if (e.success) {
                var user = e.users[0];
                $.lusernameVal.value = $.lpasswordVal.value = '';
                alert(L('logged_in_as') + ' ' + user.id);
            }
            else {
                alert('error:'+JSON.stringify(e));
            }
        });
    }

initialize();
