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
		title : L("get_50_off"),
		subtitle : L("coupon_1")
	}, {
		title : L("get_10_off_purchase"),
		subtitle : L("coupon_2")
	}, {
		title : L("sale_ends_tomorrow"),
		subtitle : L("coupon_3")
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
			Alloy.Globals.currentLoc = currentLocation;
			mapview.setRegion({
				latitude : annotations.latitude,
				longitude : annotations.longitude,
				latitudeDelta : 0.5,
				longitudeDelta : 0.5
			});
			//adding annotations
			mapview.annotations = [annotations];
		}
	});
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
	Alloy.Globals.apm.leaveBreadcrumb("main:couponClick()");
	Ti.Analytics.featureEvent('CouponClicked');
	var couponIndex = parseInt(e.row.index);
	if (favoriteCoupons.indexOf(couponsArray[couponIndex]) != "-1") {
		alert(L('coupon') + (couponIndex + 1) + L("alreadyFav"));
	} else {
		favoriteCoupons.push(couponsArray[couponIndex]);
		alert(L('coupon') + (couponIndex + 1) + L("addFav"));
	}
}

initialize();
