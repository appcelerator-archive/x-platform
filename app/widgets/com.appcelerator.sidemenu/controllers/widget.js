var menuOpen = false;

/**
 * This function show/hides the side menu
 * */
var showhidemenu=function(){
	if (menuOpen){
		moveTo="0";
		menuOpen=false;
	}else{
		moveTo="250dp";
		menuOpen=true;
	}

	
	$.drawermainview.animate({
		left:moveTo,
		curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
		duration:400
	});
};
if(OS_IOS){
	$.drawermainview.width=Ti.Platform.displayCaps.platformWidth;
	Ti.Gesture.addEventListener('orientationchange', function() {
	    $.drawermainview.width=Ti.Platform.displayCaps.platformWidth;
	});
}


exports.showhidemenu=showhidemenu;