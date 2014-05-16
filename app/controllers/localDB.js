var id;

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('localDB'));
	initializeDB();
}

/**
 * DB Initialization
 * */
function initializeDB() {
	var db = Ti.Database.open('Employee');
	db.execute('CREATE TABLE IF NOT EXISTS Employee (id INTEGER PRIMARY KEY AUTOINCREMENT , firstName TEXT, lastName TEXT);');
	fetchData();
	db.close();
}

/**
 * Selects data from table
 * */
function fetchData() {
	var db = Ti.Database.open('Employee');
	var tableData = [];
	var resultSet = db.execute('SELECT * from Employee;');
	while (resultSet.isValidRow()) {
		var row = createRow(resultSet);
		tableData.push(row);
		resultSet.next();
	}
	$.namesTable.setData(tableData);
	resultSet.close();
	db.close();
}

/**
 * Creates table rows
 * */
function createRow(rs) {
	var row = Alloy.createController("partials/dbRow", {
		first_name : rs.fieldByName('firstName'),
		last_name : rs.fieldByName('lastName'),
		id : rs.fieldByName('id'),
	}).getView();

	return row;
}

/**
 * Edits the record selected
 * */
function updateName(fname, lname, recordId) {
	$.add.title = "Update";
	id = recordId;
	$.firstNameVal.value = fname;
	$.lastNameVal.value = lname;
}

/**
 * Deletes the record selected
 * */
function deleteName(id) {
	var dialog = Ti.UI.createAlertDialog({
		message : "Are you sure you want to delete this record?",
		ok : "OK",
		buttonNames : ['OK', 'Cancel'],
		cancel : 1
	});
	dialog.show();

	dialog.addEventListener("click", function(e) {
		if (e.index === 0) {
			var db = Ti.Database.open('Employee');
			db.execute('DELETE FROM Employee WHERE id = ?', id);
			Ti.UI.createAlertDialog({
				message : "Record Deleted",
				ok : "OK"
			}).show();
			fetchData();
			db.close();
		}
	});
}

/**
 *EVENT LISTENERS
 */

/**
 * Insert and Update data into table
 * */
function addData(e) {
	$.firstNameVal.blur();
	$.lastNameVal.blur();
	if ($.firstNameVal.value !== "") {
		var db = Ti.Database.open('Employee');
		if (id) {
			db.execute('UPDATE Employee SET firstName = ? , lastName = ? WHERE id = ?', $.firstNameVal.value, $.lastNameVal.value, id);
			Ti.UI.createAlertDialog({
				message : "Record Updated",
				ok : "OK"
			}).show();
			id = "";
		} else {
			db.execute('INSERT INTO Employee (firstName, lastName) VALUES (?, ?)', $.firstNameVal.value, $.lastNameVal.value);
		}
		db.close();
		fetchData();
		$.firstNameVal.value = "";
		$.lastNameVal.value = "";
		$.add.title = "Insert";
	}

}

/**
 * perform edit and delete actions
 * */
function performOperations(e) {
	var action = e.source.id;
	var fname = e.row.fname;
	var lname = e.row.lname;
	var id = e.row.index;
	switch(action) {
		case "edit":
			updateName(fname, lname, id);
			break;
		case "del":
			deleteName(id);
			break;
		default:
			break;
	}

}

/**
 * Closes the window
 * */
function closeWindow() {
	$.localDbWin.close();
}

//Initialization Logic
initialize();
