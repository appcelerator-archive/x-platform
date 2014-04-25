/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle('Charts');
	//initialize chart
	doChart();

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
	(OS_IOS) ? Alloy.Globals.navGroup.closeWindow($.chartWin) : $.chartWin.close();
}

initialize();
