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
	main.iconContainer.addEventListener('click', $.drawermenu.showhidemenu);

	//For blackberry platform, source returns the container on which the event is attached
	//whereas for ios/android it returns the object which is clicked, hence attaching the 
	//events for every menu item rahther then to the container for BB platform.
	if (OS_IOS || OS_ANDROID) {
		//Add click event listener to menuItem Container
		menu.container.addEventListener('click', openChildWindow);
	} else if (OS_BLACKBERRY) {
		var childrens = menu.container.children;
		for (var i=0;i<childrens.length;i++) {
			childrens[i].addEventListener('click', openChildWindow);
		}
	}

	// Add view to main view container exposed by widget
	$.drawermenu.drawermainview.add(main.getView());

	//Setup Android Specific Items
	if (OS_ANDROID) {
		$.mainWin.addEventListener("androidBack", $.drawermenu.showhidemenu);
	}
}

/**
 * Opens the child window when menu item is clicked
 * */
function openChildWindow(e) {
	var source = e.source;
	var menuClicked = (source.controller) ? source.controller : source.id;
	if (source.id === 'home') {
		$.drawermenu.showhidemenu();
	} else {
		if (source.id !== 'container') {
			var childWindow = Alloy.createController(menuClicked, {
				data : source
			}).getView();
			childWindow.open();
		}
	}
}

initialize();

//Open main window
$.mainWin.open();

