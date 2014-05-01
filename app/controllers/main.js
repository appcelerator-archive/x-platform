//Initialization Parameters
var currentLocation;
var favoriteCoupons = [];
var couponsArray = [];

/**
 * Home screen Initialization
 **/

function initialize() {
	Alloy.Globals.adjustStatusBar($.container);
	//params
	var introduction = L("intro_text");

	//coupons data
	couponsArray = [{
		title : "GET 50% OFF",
		subtitle : "COUPON 1"
	}, {
		title : "$10 OFF PURCHASE",
		subtitle : "COUPON 2"
	}, {
		title : "SALE ENDS TOMORROW",
		subtitle : "COUPON 3"
	}];

	//set introduction text
	$.introtext.text = introduction;

	//Add coupons to coupons table
	addCoupons(couponsArray);

	//set current location in Geolocation section
	setCurrentLocationInMap();
}

/**
 * HELPER METHODS
 */

/**
 * function to set current location
 */
function setCurrentLocationInMap() {
	// Geo-location Section
	var Map = OS_IOS || OS_ANDROID ? require("ti.map") : Ti.Map;
	var mapview = Map.createView({
		mapType : Map.NORMAL_TYPE
	});
	var annotations = Map.createAnnotation();
	//Setup Geolocation
	Ti.Geolocation.purpose = "Setting your location";
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_LOW;
	Ti.Geolocation.preferredProvider = "gps";
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (e.coords && e.coords.latitude) {
			annotations.latitude = e.coords.latitude;
			annotations.longitude = e.coords.longitude;
			annotations.title = L("my_location");

			//setting the value of current location
			currentLocation = annotations;
			Ti.App.Properties.setString('currentLocation', JSON.stringify(currentLocation));

			mapview.setRegion({
				latitude : annotations.latitude,
				longitude : annotations.longitude,
				latitudeDelta : 0.5,
				longitudeDelta : 0.5
			});
		}
	});

	//adding annotations
	mapview.annotations = [annotations];

	$.geolocator.add(mapview);
}

/**
 *function to add coupons into the table
 */
function addCoupons(couponsArray) {
	var data = [];
	// add coupons data to coupons table
	for (var i in couponsArray) {
		var row = Alloy.createController("partials/couponRow", {
			data : couponsArray[i],
			index : i
		}).getView();
		data.push(row);
	}
	$.couponsTable.data = data;
}

/**
 *EVENT LISTENERS
 */

/**
 * adds coupons to favorite coupons list
 */
function couponClick(e) {
	Alloy.Globals.apm.leaveBreadcrumb("couponClick()");
	Ti.Analytics.featureEvent('CouponClicked');
	var couponIndex = parseInt(e.row.index);
	if (favoriteCoupons.indexOf(couponsArray[couponIndex]) != "-1") {
		alert("Coupon " + (couponIndex + 1) + " has already been added to your favorites.");
	} else {
		favoriteCoupons.push(couponsArray[couponIndex]);
		alert("Coupon " + (couponIndex + 1) + " has been added to your favorites.");
	}
}

initialize();
