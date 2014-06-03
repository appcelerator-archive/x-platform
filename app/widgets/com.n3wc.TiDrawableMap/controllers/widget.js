var args = arguments[0] || {};
var convex_hull = require(WPATH('convex_hull'));
var convexHull = new convex_hull;
var useConvexHull = true;
$.allPoints = $.hullPoints = [];
var mapRegion;
var route;
var drawableWidth;
var drawableHeight;
var topLeftLat;
var topLeftLon;
var widthRatio;
var heightRatio;
var lineColor ='#c60000';
var lineWidth =4;
var throttleTimer=75;
var routeAdded = false;

var handlers = {};
handlers.drawStart = function(r){};
handlers.drawEnd = function(r){};
exports.addEventListener = function(listenerName, listenerFunction){
	switch(listenerName){
		case 'drawStart' : 
			handlers.drawStart = listenerFunction;
			break;
		case 'drawEnd' : 
			handlers.drawEnd = listenerFunction;
			break;
	};
};

$.init = function(args){
	_args = args || {};
	$.TiDrawableMapView.region = typeof(_args.mapRegion) != "undefined"?_args.mapRegion:mapRegion;
	if(typeof(_args.lineColor) != "undefined")lineColor = _args.lineColor;
	if(typeof(_args.lineWidth) != "undefined")lineWidth = _args.lineWidth;
	if(typeof(_args.throttleTimer) != "undefined")throttleTimer = _args.throttleTimer;
};

$.setSizes = function() {
	if (OS_ANDROID) {
		//if we do not call this info line then we get the wong sizes for width/height
		//do no comment out the info
		Ti.API.info($.TiDrawableMapDrawingView.toImage().height + ' >> ' + $.TiDrawableMapDrawingView.toImage().width );
		drawableWidth = $.TiDrawableMapDrawingView.toImage().width;
		drawableHeight = $.TiDrawableMapDrawingView.toImage().height;
	}else{
		drawableWidth = $.TiDrawableMapDrawingView.size.width;
		drawableHeight = $.TiDrawableMapDrawingView.size.height;
	}
	Ti.API.info('set sizes::: drawableWidth: '+drawableWidth+' drawableHeight: '+drawableHeight);
};

$.clearRoute = function(){
	if(routeAdded){$.TiDrawableMapView.removeRoute(route);}
	routeAdded = false;
};

$.startDraw = function(args){
	var _args = args || {};
	if(typeof(_args.useConvexHull) != "undefined"){useConvexHull = _args.useConvexHull;}
	if(typeof(_args.lineColor) != "undefined"){lineColor = _args.lineColor;}
	if(typeof(_args.lineWidth) != "undefined"){lineWidth = _args.lineWidth;}
	if(typeof(_args.throttleTimer) != "undefined"){throttleTimer = _args.throttleTimer;}
	
	$.allPoints.length = $.hullPoints.length = 0;
	
	if(routeAdded){
		$.TiDrawableMapView.removeRoute(route);
	}
	//touchenabled would not work on android se had to fall back to using zindexes
	$.TiDrawableMapDrawingView.zIndex = 3;
	routeAdded = false;
};

$.TiDrawableMapView.addEventListener('regionchanged',function(e){
	mapRegion = e;
	topLeftLat = mapRegion.latitude + (mapRegion.latitudeDelta/2);
	topLeftLon = mapRegion.longitude - (mapRegion.longitudeDelta/2);
	widthRatio = mapRegion.longitudeDelta/drawableWidth;
	heightRatio = mapRegion.latitudeDelta/drawableHeight;
	Ti.API.info('regionchanged::: topLeftLat: '+topLeftLat+' topLeftLon: '+topLeftLon+' topLeftLon: '+widthRatio+' heightRatio: '+heightRatio);
});

$.TiDrawableMapDrawingView.addEventListener('touchstart',function(e){
	handlers.drawStart();
	addPoint(e);
});

//Workaround for https://jira.appcelerator.org/browse/TIMOB-14213
if (OS_ANDROID) {
	getTime = (Date.now ||
	function() {
		return new Date().getTime();
	});

	// Monkey patch throttle and debounce to fix bug in throttle function on
	// Titanium (3.2.0.GA) Android.

	_.throttle = function(func, wait, options) {
		var context, args, result, timeout, previous, later;

		timeout = null;
		previous = 0;
		options = options || {};

		later = function() {
			previous = options.leading === false ? 0 : getTime();
			timeout = null;
			result = func.apply(context, args);
			context = args = null;
		};

		return function() {
			var now, remaining;
			now = getTime();

			if (!previous && options.leading === false) {
				previous = now;
			}

			remaining = wait - (now - previous);
			context = this;
			args = arguments;

			if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
				context = args = null;

			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}

			return result;
		};
	};

	_.debounce = function(func, wait, immediate) {
		var timeout, args, context, timestamp, result, later = function() {
			var last = getTime() - timestamp;

			if (last < wait) {
				timeout = setTimeout(later, wait - last);

			} else {
				timeout = null;

				if (!immediate) {
					result = func.apply(context, args);
					context = args = null;
				}
			}
		};

		return function() {
			var callNow = immediate && !timeout;

			context = this;
			args = arguments;
			timestamp = getTime();

			if (!timeout) {
				timeout = setTimeout(later, wait);
			}

			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}

			return result;
		};
	};
}

function finalizeDraw(){
	if(useConvexHull){
		calculateConvexHull();
	}
	handlers.drawEnd();
}

$.TiDrawableMapDrawingView.addEventListener('touchend',function(e){
	//touch enabled would not work on android so had to use zindexes
	$.TiDrawableMapDrawingView.zIndex = 1;
	setTimeout(finalizeDraw,throttleTimer*1.25);
});


var touchMove = _.throttle(function(e){addPoint(e)},throttleTimer)

$.TiDrawableMapDrawingView.addEventListener('touchmove',touchMove);

function addPoint(e){
	Ti.API.info(e.x+','+e.y);
	Ti.API.info(topLeftLat+','+topLeftLon);
	Ti.API.info(heightRatio+','+widthRatio);
	$.allPoints.push({
	    latitude: (topLeftLat-(e.y*heightRatio)),
	    longitude: (topLeftLon+(e.x*widthRatio))
	});
	addDrawing();
}

function addDrawing(drawPoints){
	if(routeAdded){
		$.TiDrawableMapView.removeRoute(route);
	}
	route = Alloy.Globals.Map.createRoute({
            name: 'TiDrawableMapRoute',
            points: typeof(drawPoints) != "undefined"?drawPoints:$.allPoints,
            color: lineColor,
            width: lineWidth
        });
	$.TiDrawableMapView.addRoute(route);
	routeAdded=true;
}
function calculateConvexHull() {
	$.hullPoints = convexHull.convex_hull($.allPoints);
	addDrawing($.hullPoints);
	Ti.API.info(JSON.stringify($.allPoints));
	Ti.API.info(JSON.stringify($.hullPoints));
}


