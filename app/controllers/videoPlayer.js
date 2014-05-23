var loading  =  Ti.UI.createActivityIndicator();
/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('videoPlayer'));
	$.movieView.add(loading);
}

/**
 * Event Listeners
 */

$.movie.addEventListener('load', function(){
	loading.hide();
});

/**
 * hides loading indicator when the movie plays - for blackberry
 */
$.movie.addEventListener('change', function(e){
	if(e.state === "Playing"){
		loading.hide();
	}
});
/**
 * Plays the local video
 */
function playLocal(e){
	$.movie.url = '/movie.mp4';
	$.movie.play();
}

/**
 * Plays the remote video
 */
function playRemote(e){
	var contentURL = 'http://movies.apple.com/media/us/ipad/2010/tours/apple-ipad-video-us-20100127_r848-9cie.mov';
	if (!OS_IOS) {
		loading.show();
		contentURL = "http://dts.podtrac.com/redirect.mp4/twit.cachefly.net/video/aaa/aaa0033/aaa0033_h264b_640x368_256.mp4";
	}
	$.movie.url = contentURL;
	$.movie.play();
	
}


/**
 * Closes the window
 * */
function closeWindow() {
	$.movie.stop();
	$.movie.release();
	$.videoPlayerWin.close();
}

initialize();