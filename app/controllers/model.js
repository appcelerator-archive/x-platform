/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('model'));
};

/**
 * Closes the window
 * */
function closeWindow() {
	$.modelWin.close();
};


/**
 * Add the book
 * */
function addBook(){
	
};

initialize();
