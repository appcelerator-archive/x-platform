var sound = Titanium.Media.createSound();

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('audioPlayer'));

}

/**
 * Helper Method
 */

/**
 * Plays sound given a URL as a parameter
 */
function playSound(url) {
	sound.release();
	sound.url = url;
	$.pause.enabled = true;
	$.stop.enabled = true;
	$.pause.backgroundImage = "/images/pause.png";
	if (OS_IOS) {
		$.indicator.hide();
		$.progressBar.value = 0;
		$.progressBar.max = sound.duration * 1000;
	}
	sound.play();

}

/**
 * Event Listeners
 */

/**
 * pauses a sound
 */
function pauseSound() {
	if (sound.isPaused()) {
		$.pause.backgroundImage = "/images/pause.png";
		sound.play();
	} else {
		$.pause.backgroundImage = "/images/play.png";
		sound.pause();
	}

}

/**
 * stops a sound
 */
function stopSound() {
	$.pause.backgroundImage = "/images/pause.png";
	sound.stop();
	if (OS_IOS) {
		$.progressBar.value = 0;
	}

}

/**
 * plays local sound
 */
function playLocalSound() {
	var url = '/AlarmDrum.wav';
	playSound(url);
}

/**
 * plays remote sound
 */
function playRemoteSound() {
	if (OS_IOS) {
		$.indicator.show(L('loading'));
	}
	var url = "http://www.archive.org/download/CelebrationWav/1.wav";
	playSound(url);
}

/**
 * Interval to update the progress bar
 */
var interval = setInterval(function() {
	if (OS_IOS) {
		if (sound.isPlaying()) {
			$.progressBar.value = sound.time;
			if (Math.round((parseInt($.progressBar.getMax()) - parseInt($.progressBar.getValue())) / 1000) === 0) {
				$.pause.enabled = false;
				$.stop.enabled = false;
			}
		}
	}

}, 50);

/**
 * Closes the window
 * */
function closeWindow() {
	sound.release();
	clearInterval(interval);
	$.audioPlayerWin.close();
}

initialize();
