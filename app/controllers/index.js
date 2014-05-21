/**
 * Home screen Initialization
 * */
function initialize() {
	// Create menu controller
	var menu = Alloy.createController("menu");
	
	//Create main view controller
	var main = Alloy.createController("main");
	
	//initializes the slider menu
	$.drawermenu.init({
		mainview:main.getView(),
		menuview:menu.getView(),
		parent:$.mainWin,
		duration:200
	});
	

	//Add click event listener to open/close menu
	main.iconContainer.addEventListener('click', $.drawermenu.showhidemenu);

	//For blackberry platform, source returns the container on which the event is attached
	//whereas for ios/android it returns the object which is clicked, hence attaching the 
	//events for every menu item rahther then to the container for BB platform.
	if (OS_IOS || OS_ANDROID || OS_MOBILEWEB) {
		//Add click event listener to menuItem Container
		menu.container.addEventListener('click', openChildWindow);
	} else if (OS_BLACKBERRY) {
		var childrens = menu.container.children;
		for (var i=0;i<childrens.length;i++) {
			childrens[i].addEventListener('click', openChildWindow);
		}
	}
	//Setup Android Specific Items
	if (OS_ANDROID) {
		$.mainWin.addEventListener("androidBack", showHideMenu);
	}
}

/**
 * Opens the child window when menu item is clicked
 * */
function openChildWindow(e) {
	var source = e.source;
	var menuClicked = (source.controller) ? source.controller : source.id;
	if (source.id === 'home') {
		showHideMenu();
	} else {
		if (source.id !== 'container') {
			var childWindow = Alloy.createController(menuClicked, {
				data : source
			}).getView();
			childWindow.open();
		}
	}
}

/**
 * This function show/hides the menu
 * */
function showHideMenu(){
	$.drawermenu.showhidemenu();
	$.drawermenu.menuOpen=!$.drawermenu.menuOpen;
}

//Initialization stuff
initialize();

//Open main window
$.mainWin.open();

