/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('layouts'));
	
	//creates fixed layout view
	generateViews(9, $.fixedLayout);
	
	//creates dynamic layout view
	generateViews(20, $.dynamicLayout);
}

/**
 * Adds labels to the view dynamically
 */
function generateViews(max, view){
	var options = {
		top : 5,
		left : 5,
		height : 50,
		width : 50,
		backgroundColor : "#555",
		textAlign : "center",
		color: "white"
	};
	for (var i = 1; i <= max; i++) {
		var label = Ti.UI.createLabel(options);
		view.add(label);
		label.text = i;
	}
}


/**
 * Closes the window
 * */
function closeWindow() {
	$.layoutWin.close();
}

initialize();
