var id;
var database = Alloy.Globals.db;
var encryptON = true;
/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('localDB'));
	$.add.setTitle(L('insert'));
	initializeDB();
}

/**
 * DB Initialization
 * */
function initializeDB() {
	var db = Ti.Database.open(database);
	db.execute('CREATE TABLE IF NOT EXISTS Employee (id INTEGER PRIMARY KEY AUTOINCREMENT , firstName TEXT, lastName TEXT);');
	fetchData();
	db.close();
}

/**
 * Selects data from table
 * */
function fetchData() {
	var db = Ti.Database.open(database);
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
		editCallback : updateRow,
		delCallback : deleteRow
	}).getView();

	return row;
}

/**
 * Edits the record selected
 * */
function updateRow(fname, lname, recordId) {
	$.add.title = L('update');
	id = recordId;
	$.firstNameVal.value = fname;
	$.lastNameVal.value = lname;
}

/**
 * resets the first name last name and insert button
 */
function reset() {
	id = "";
	$.firstNameVal.value = "";
	$.lastNameVal.value = "";
	$.add.title = L('insert');
}

/**
 * Deletes the record selected
 * */
function deleteRow(id) {
	var dialog = Ti.UI.createAlertDialog({
		message : L('delRecord'),
		ok : L("ok"),
		buttonNames : [L("ok"), L('cancel')],
		cancel : 1
	});
	dialog.show();

	dialog.addEventListener("click", function(e) {
		if (e.index === 0) {
			var db = Ti.Database.open(database);
			db.execute('DELETE FROM Employee WHERE id = ?', id);
			Ti.UI.createAlertDialog({
				message : L('record_deleted'),
				ok : L("ok")
			}).show();
			fetchData();

			//Incase the Update option is selected and then the user clicks delete
			reset();

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
	if (($.firstNameVal.value).trim() !== "" && $.firstNameVal.value !== undefined) {
		var db = Ti.Database.open(database);
		$.lastNameVal.value = ($.lastNameVal.value === undefined) ? "" : $.lastNameVal.value;
		var firstName = $.firstNameVal.value;
		var lastName = $.lastNameVal.value;
		if(encryptON == true){
			var crypto = require("/crypto");
			crypto.init("KEYSIZE_AES128");
			firstName = crypto.encrypt({
				source : $.firstNameVal.value,
				type : "TYPE_HEXSTRING"
			});
			lastName = crypto.encrypt({
				source : $.lastNameVal.value,
				type : "TYPE_HEXSTRING"
			});
		}
		if (id) {
			db.execute('UPDATE Employee SET firstName = ? , lastName = ? WHERE id = ?', firstName, lastName, id);
			Ti.UI.createAlertDialog({
				message : L('record_updated'),
				ok : L("ok")
			}).show();
			id = "";
		} else {
			db.execute('INSERT INTO Employee (firstName, lastName) VALUES (?, ?)', firstName, lastName);
		}
		db.close();
		fetchData();
		$.firstNameVal.value = "";
		$.lastNameVal.value = "";
		$.add.title = L('insert');
	}

}

/**
 * perform edit and delete actions
 * */
function performOperations(e) {
	var action = e.source.id;
	var fname = e.row.fname;
	var lname = e.row.lname;
	var index = e.row.index;
	switch(action) {
		case "edit":
			updateRow(fname, lname, index);
			break;
		case "del":
			deleteRow(index);
			break;
		default:
			break;
	}

}
/**
 * Set Encryption On/Off
 */
function setEncryption(){
	encryptON=encryptON==false?true:false;
	$.encrypt.backgroundImage = encryptON==true?"/lock.png":"/unlock.png";
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.localDbWin.close();
}

//Initialization Logic
initialize();
