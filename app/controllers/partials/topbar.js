/**
 * Sets the window title
 * */
$.setTitle=function(title){
	$.title.text=title;
};

//Sets the top for ios>=7
if (OS_IOS && Ti.Platform.version >= 7) {
		$.topbar.top = 20;
}else{
	$.topbar.top= 0;
}

