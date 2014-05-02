/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('charts'));
}

//EVENT LISTENER
function doChart() {
	var options = {};
	options.data = new Array(Math.floor(Math.random() * 1001), Math.floor(Math.random() * 1001), Math.floor(Math.random() * 1001), Math.floor(Math.random() * 1001), Math.floor(Math.random() * 1001));
	setTimeout(function() {
		Ti.App.fireEvent('renderChart', options);
	}, 400);

};

/**
 * Closes the window
 * */
function closeWindow() {
	$.chartWin.close();
}

initialize();
