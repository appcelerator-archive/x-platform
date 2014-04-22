
//params
var introduction = "This application demonstrates the cross-platform capabilities of the Appcelerator platform. The application supports iOS, Android, Windows Mobile, Blackberry, Tizen, and mobile web. \n \nOpen the menu to see various demonstrations; some demonstrations are also visible below.";
var data = [];
var favoriteCoupons = [];
//coupons data
var couponsArray = [
	{title: "GET 50% OFF", subtitle: "COUPON 1"},
	{title: "$10 OFF PURCHASE", subtitle: "COUPON 2"},
	{title: "SALE ENDS TOMORROW", subtitle: "COUPON 3"}
];

//set introduction text
$.introtext.text = introduction;

// add coupons data to coupons table
	for(var i in couponsArray){
		var row = Alloy.createController("partials/couponRow", {data: couponsArray[i], index : i}).getView();
		data.push(row);
	}
$.couponsTable.data = data;

 // Geo-location Section
if(OS_IOS){
	//adding a map view
var Map = require('ti.map');
var mapview = Map.createView({mapType:Map.STANDARD_TYPE});
var annotations = Map.createAnnotation({});

//Setup Geolocation
Ti.Geolocation.purpose = "Setting your location";
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_LOW;
Ti.Geolocation.preferredProvider = "gps";

Ti.Geolocation.getCurrentPosition(function(e) {
	if(e.coords.longitude && e.coords.latitude){
	annotations.latitude = e.coords.latitude;
	annotations.longitude = e.coords.longitude;
	annotations.title = "My Location";
	annotations.animated = true;
	
	}
});
mapview.annotations = [annotations];
$.geolocator.add(mapview);
}

//EVENT LISTENERS
function couponClick(e){
	Alloy.Globals.apm.leaveBreadcrumb("couponClick()"); 
	Ti.Analytics.featureEvent('CouponClicked');
	var couponIndex = parseInt(e.row.index);
	if(favoriteCoupons.indexOf(couponsArray[couponIndex])!="-1"){
		alert("Coupon "+(couponIndex + 1)+" has already been added to your favorites.");
	} else {
		favoriteCoupons.push(couponsArray[couponIndex]);
		alert("Coupon "+(couponIndex + 1)+" has been added to your favorites.");
	}
}
