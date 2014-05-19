//Sets the top for ios>=7
Alloy.Globals.adjustStatusBar($.container);

/**
 * This changes the background color for menu rows
 * */
function changeBackgroundColor(e) {
	var source = e.source;
	if (source.id !=='container') {
		var initialBackgroundColor = source.backgroundColor;
		// set new BackgroundColor
		source.backgroundColor = '#555';

		// wait 500 milliseconds and switch back to the original BackgroundColor
		setTimeout(function() {
			source.backgroundColor = initialBackgroundColor;
		}, 500);
	}

}
