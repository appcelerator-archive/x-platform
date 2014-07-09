var books = Alloy.Collections.book;
var bookId = "";
/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('model'));
	//Fetches all the data
	books.fetch();
};

/**
 * Closes the window
 * */
function closeWindow() {
	$.modelWin.close();
};

/**
 * This will clear out the view binding on the tableView
 * @method clearBinding
 */
var clearBinding = function(){
	$.destroy();
};
$.modelWin.addEventListener("close", clearBinding );

/**
 * Add the book in DB
 * */
function addBook() {
	// Create a new model for the todo collection
	var book = Alloy.createModel('book', {
		title : $.titleVal.value,
		author : $.authorVal.value
	});
	// save the model to persistent storage, which will give
	// a uniqueid and update the UI
	if (book.isValid() > 0) {
		// add new model to the global collection
		books.add(book, {
			silent : true
		});
		book.save();
		clearData();
		$.titleVal.blur();
		$.authorVal.blur();
	}
};

/**
 * Update the book in DB
 * */
function updateBook() {
	var book = Alloy.createModel('book', {
		title : $.titleVal.value,
		author : $.authorVal.value

	});
	if (book.isValid() > 0) {
		// Performs a GET on /book/id
		book.fetch({
			id : bookId
		});

		// Performs a PUT on /book/id with the entire modified object as a payload.
		book.save({
			checkout : true,
			title : $.titleVal.value,
			author : $.authorVal.value

		});
		books.fetch();
		clearData();
	}

}

/**
 * Delete the book from DB
 * */
function deleteBook(id) {
	var book = Alloy.createModel('book');
	// Performs a GET on /book/id
	book.fetch({
		id : id
	});
	// Performs a DELETE on /book/id
	book.destroy();
	books.fetch();
	clearData();
}

function performOperation(e) {
	var id = e.source.rowid;
	switch(e.source.type) {
		case "edit":
			$.add.title = L("update_book");
			$.titleVal.value = e.source.title;
			$.authorVal.value = e.source.author;
			bookId = id;
			break;
		case "delete":
			var dialog = Ti.UI.createAlertDialog({
				message : L('delRecord'),
				ok : L("ok"),
				buttonNames : [L("ok"), L('cancel')],
				cancel : 1
			});
			dialog.show();
			dialog.addEventListener("click", function(e) {
				if (e.index === 0) {
					deleteBook(id);
				}
			});
			break;
	}
}

/**
 * Perform cleanup tasks
 * */
function clearData() {
	bookId = "";
	$.titleVal.value = "";
	$.authorVal.value = "";
	$.add.title = L("add_book");
}

/**
 * Decide whether to add/upadte the data based of bookid
 * */
function addupdate(e) {
	if (bookId === "") {
		addBook();
	} else {
		updateBook();
	}
}

//Initializes Screen
initialize();
