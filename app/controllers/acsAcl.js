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
		title : 'Loading, please wait...'
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

function animateView(e){
	var source= $[e.source.id+'View'];
	source.visible = true;
	var height = source.height === 1 ? Ti.UI.SIZE : 1;
	var animationObject = Ti.UI.createAnimation({
		height : height,
		duration : 200
	});
	animationObject.addEventListener('complete', function(){
		source.height = height;
		source.visible = source.height === 1 ? false : true;
	});
	source.animate(animationObject);
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
			alert('Created!');
		} else {
			error(e);
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
			alert('Shown!');
		} else {
			error(e);
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
			alert('Updated!');
		} else {
			error(e);
		}
	});
}

function removeACL() {
	Cloud.ACLs.remove({
		name : $.snameVal.value
	}, function(e) {
		if (e.success) {
			alert('Removed!');
		} else {
			error(e);
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
			alert('Added!');
		} else {
			error(e);
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
			alert('Removed!');
		} else {
			error(e);
		}
	});
}

function hideTable() {
	$.tableContent.visible = false;
}

function queryUsers() {
	Cloud.Users.query(function(e) {
		if (e.success) {
			if (e.users.length == 0) {
				$.userTable.setData([{
					title : 'No Users!'
				}]);
			} else {
				var data = [];
				if ( typeof access.publicAccess != 'undefined') {
					data.push({
						title : '<Public Access>',
						id : 'publicAccess',
						hasCheck : access.publicAccess || false
					});
				}
				for (var i = 0, l = e.users.length; i < l; i++) {
					var user = e.users[i];
					var row = Ti.UI.createTableViewRow({
						title : user.first_name + ' ' + user.last_name,
						id : user.id
					});
					row.hasCheck = access.ids.indexOf(user.id) != -1;
					data.push(row);
				}
				$.userTable.setData(data);
				$.tableContent.visible = true;
			}
		} else {
			$.userTable.setData([{
				title : (e.error && e.message) || e
			}]);
			error(e);
		}
	});
}

function error(e) {
	Ti.API.info(JSON.stringify(e));
}

initialize();
