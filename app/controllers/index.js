/**
 * Home screen Initialization
 * */
function initialize() {
	// Create menu controller
	var menu = Alloy.createController("menu");

	// Add view to menu container exposed by widget
	$.drawermenu.drawermenuview.add(menu.getView());

	//Create main view controller
	var main = Alloy.createController("main");

	//Add click event listener to open/close menu
	main.menuicon.addEventListener('click', $.drawermenu.showhidemenu);

	//Add click event listener to open/close menu
	menu.container.addEventListener('click', openChildWindow);

	// Add view to main view container exposed by widget
	$.drawermenu.drawermainview.add(main.getView());

	//Setup Android Specific Items
	if (OS_ANDROID) {
		$.mainWin.addEventListener("androidBack", $.drawermenu.showhidemenu);
	}
	if (OS_IOS) {
		Alloy.Globals.navGroup = $.navGroup;
	}
}

/**
 * Opens the child window when menu item is clicked
 * */
function openChildWindow(e) {
	var menuClicked = (e.source.controller) ?e.source.controller :  e.source.id;
	if (e.source.id === 'home') {
		$.drawermenu.showhidemenu();
	} else {
		if (e.source.id !== 'container') {
			var childWindow = Alloy.createController(menuClicked,{data: e.source}).getView();
			(OS_IOS) ? Alloy.Globals.navGroup.openWindow(childWindow) : childWindow.open();
		}
	}
}

initialize();

//Open main window
(OS_IOS) ? $.navGroup.open() : $.mainWin.open();

