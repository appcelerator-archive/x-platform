/**
 * Initializes home
 * */
function initialize() {
	// Create menu controller
	var menu =Alloy.createController("menu");
	
	// Add view to menu container exposed by widget
	$.drawermenu.drawermenuview.add(menu.getView());

	//Create main view controller
	var main = Alloy.createController("main");

	//Add click event listener to open/close menu
	main.menuicon.addEventListener('click', $.drawermenu.showhidemenu);
	
	//Add click event listener to open/close menu
	menu.map.addEventListener('click', openMap);
	
	// Add view to main view container exposed by widget
	$.drawermenu.drawermainview.add(main.getView());

	//Setup Android Specific Items
	if (OS_ANDROID) {
		$.index.addEventListener("androidBack", $.drawermenu.showhidemenu);
	}

}

/*
 * EVENT LISTENERS
 */
function openMap(){
	$.drawermenu.showhidemenu();
	var map = Alloy.createController("map").getView();
	map.open();
}

initialize();

//Open main window
$.index.open();

