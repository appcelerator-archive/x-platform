
//params
var introduction = "This application demonstrates the cross-platform capabilities of the Appcelerator platform. The application supports iOS, Android, Windows Mobile, Blackberry, Tizen, and mobile web. \n \n Open the menu to see various demonstrations; some demonstrations are also visible below.";
var data = [];
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
		var row = Alloy.createController("partials/couponRow", {data: couponsArray[i]}).getView();
		data.push(row);
	}

$.couponsTable.data = data;