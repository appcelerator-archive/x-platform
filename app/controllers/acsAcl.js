var Cloud = require('ti.cloud');

/**
 * Initialization Parameters
 */
var access;
var readers = {
	publicAccess : false,
	ids : []
};
var writers = {
	publicAccess : false,
	ids : []
};

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('acs_acl'));
	$.userTable.setData([{
		title : L('loading')
	}]);
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.acsAclWin.close();
}

/*
 * Table click event listener to select user
 */
function selectUser(evt) {
	if (evt.row.id) {
		evt.row.hasCheck = !evt.row.hasCheck;
		if (evt.row.id === 'publicAccess') {
			access.publicAccess = evt.row.hasCheck;
		} else if (evt.row.hasCheck) {
			access.ids.push(evt.row.id);
		} else {
			access.ids.splice(access.ids.indexOf(evt.row.id), 1);
		}
	}
}

/**
 * Animate the forms
 * */
function animateView(e) {
	var source = $[e.source.id + 'View'];
	source.visible = true;
	var height = source.height === 1 ? Ti.UI.SIZE : 1;
	if (OS_IOS) {
		var animationObject = Ti.UI.createAnimation({
			height : height,
			duration : 200
		});
		animationObject.addEventListener('complete', function() {
			source.height = height;
			source.visible = source.height === 1 ? false : true;
		});
		source.animate(animationObject);
	} else {
		source.height = height;
		source.visible = source.height === 1 ? false : true;
	}
	if(e.source.id === 'check'){
		$.permissionTable.setData([{
			title : L('loading')
		}]);
		populateUsers();
	}
}

function populateUsers() {
	Cloud.Users.query(function(e) {
		if (e.success) {
			if (e.users.length == 0) {
				$.permissionTable.setData([{
					title : 'No Users!'
				}]);
			} else {
				var data = [];
				for (var i = 0, l = e.users.length; i < l; i++) {
					var user = e.users[i];
					var rowData = {
						title : user.first_name + ' ' + user.last_name,
						id : user.id
					};
					var row = Alloy.createController('partials/aclRow', {
						data : rowData
					});
					data.push(row.getView());
				}
				$.permissionTable.setData(data);
			}
		} else {
			$.permissionTable.setData([{
				title : (e.error && e.message) || e
			}]);
			Ti.API.info(JSON.stringify(e));
		}
	});
}

function selectReader() {
	access = readers;
	queryUsers();
}

function selectWriter() {
	access = writers;
	queryUsers();
}

function createACL() {
	if ($.nameVal.value.length == 0) {
		$.nameVal.focus();
		return;
	}
	Cloud.ACLs.create({
		name : $.nameVal.value,
		reader_ids : readers.ids.join(','),
		writer_ids : writers.ids.join(','),
		public_read : readers.publicAccess,
		public_write : writers.publicAccess
	}, function(e) {
		if (e.success) {
			alert(L('created') + '!');
		} else {
			Ti.API.info(JSON.stringify(e));
		}
	});
}

function showAcl() {
	if ($.snameVal.value.length == 0) {
		$.snameVal.focus();
		return;
	}
	Cloud.ACLs.show({
		name : $.snameVal.value
	}, function(e) {
		if (e.success) {
			var acls = e.acls[0];
			readers.publicAccess = acls.public_read || false;
			readers.ids = acls.readers || [];
			writers.publicAccess = acls.public_write || false;
			writers.ids = acls.writers || [];
			alert(L('shown') + '!');
		} else {
			Ti.API.info(JSON.stringify(e));
		}
	});
}

function updateACL() {
	Cloud.ACLs.update({
		name : $.snameVal.value,
		reader_ids : readers.ids.join(','),
		writer_ids : writers.ids.join(','),
		public_read : readers.publicAccess,
		public_write : writers.publicAccess
	}, function(e) {
		if (e.success) {
			alert(L('updated') + '!');
		} else {
			Ti.API.info(JSON.stringify(e));
		}
	});
}

function removeACL() {
	Cloud.ACLs.remove({
		name : $.snameVal.value
	}, function(e) {
		if (e.success) {
			alert(L('removed') + '!');
		} else {
			Ti.API.info(JSON.stringify(e));
		}
	});
}

function addUser() {
	if ($.unameVal.value.length == 0) {
		$.unameVal.focus();
		return;
	}
	Cloud.ACLs.addUser({
		name : $.unameVal.value,
		reader_ids : readers.ids.join(','),
		writer_ids : writers.ids.join(',')
	}, function(e) {
		if (e.success) {
			alert(L('added') + '!');
		} else {
			Ti.API.info(JSON.stringify(e));
		}
	});
}

function removeUser() {
	Cloud.ACLs.removeUser({
		name : $.unameVal.value,
		reader_ids : readers.ids.join(','),
		writer_ids : writers.ids.join(',')
	}, function(e) {
		if (e.success) {
			alert(L('removed') + '!');
		} else {
			Ti.API.info(JSON.stringify(e));
		}
	});
}

function hideTable() {
	$.tableContent.visible = false;
}

function checkUserPermission(evt){
	if ($.cnameVal.value.length == 0) {
    		$.cnameVal.focus();
    		return;
    	}
        if (evt.row.id) {
    		Cloud.ACLs.checkUser({
    			name: $.cnameVal.value,
            	user_id: evt.row.id
        	}, function (e) {
            	if (e.success) {
					alert('Read Permission: ' + (e.permission['read_permission'] ? 'Yes': 'No') +  
						  '\nWrite Permission: ' + (e.permission['write_permission'] ? 'Yes': 'No'));
            	} else {
                	Ti.API.info(JSON.stringify(e));
            	}
        	});
        }
}

function queryUsers() {
	$.userTable.setData([{
		title : L('loading')
	}]);
	$.tableContent.visible = true;
	Cloud.Users.query(function(e) {
		if (e.success) {
			if (e.users.length == 0) {
				$.userTable.setData([{
					title : L('no_users')
				}]);
			} else {
				var data = [];
				if ( typeof access.publicAccess != 'undefined') {
					var rowData = {
						title : '<'+L('public_access')+'>',
						id : 'publicAccess',
						hasCheck : access.publicAccess || false
					};
					var row = Alloy.createController('partials/aclRow',{data: rowData});
					data.push(row.getView());
				}
				for (var i = 0, l = e.users.length; i < l; i++) {
					var user = e.users[i];
					var rowData = {
						title : user.first_name + ' ' + user.last_name,
						id : user.id,
						hasCheck : (access.ids.indexOf(user.id) != -1)
					};
					var row = Alloy.createController('partials/aclRow',{data: rowData});
					data.push(row.getView());
				}
				$.userTable.setData(data);
			}
		} else {
			$.userTable.setData([{
				title : (e.error && e.message) || e
			}]);
			Ti.API.info(JSON.stringify(e));
		}
	});
}

initialize();
