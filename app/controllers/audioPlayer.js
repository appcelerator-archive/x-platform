var sound = Titanium.Media.createSound();

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle('Audio Player');

}
/**
 * Helper Method
 */

/**
 * Plays sound given a URL as a parameter
 */
function playSound(url) {
	sound.release();
	$.progressBar.value = 0;
	sound.url = url;
	$.pause.enabled = true;
	$.stop.enabled = true;
	sound.play();
	Ti.API.info('sound duration ' + sound.duration * 1000 + " seconds");
	$.progressBar.max = sound.duration * 1000;
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
	$.progressBar.value = 0;
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
	var url = "http://www.archive.org/download/CelebrationWav/1.wav";
	playSound(url);
}

/*
 * INTERVAL TO UPDATE PROGRESS BAR
 */
var i = setInterval(function() {
	if (sound.isPlaying()) {
		$.progressBar.value = sound.time;
		
		//need to refactor
		if (Math.round((parseInt($.progressBar.getMax()) - parseInt($.progressBar.getValue())) / 1000) === 0) {
			$.pause.enabled = false;
			$.stop.enabled = false;
		}
	}
}, 50);

/**
 * Closes the window
 * */
function closeWindow() {
	clearInterval(i);
	sound.release();
	$.audioPlayerWin.close();
}

initialize();
