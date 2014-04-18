// Add view to menu container exposed by widget
$.drawermenu.drawermenuview.add(Alloy.createController("menu").getView());

//Create main view controller
var main = Alloy.createController("main");

//Add click event listener to open/close menu
main.menuicon.addEventListener('click',$.drawermenu.showhidemenu);

// Add view to main view container exposed by widget
$.drawermenu.drawermainview.add(main.getView());

//Open main window
$.index.open();

//Setup Android Specific Items
if(OS_ANDROID){
	$.index.addEventListener("androidBack",$.drawermenu.showhidemenu);
}