var args = arguments[0] || {};
var annotations = [];
var locations = [];
var currentLoc = Alloy.Globals.myLoc;

//Setup V2 Maps Module
var Map = require('ti.map');
var mapview = Map.createView({mapType:Map.NORMAL_TYPE});

//Create map locations
var data = [
	currentLoc,
	{
		latitude: 37.389569,
		longitude: -122.050212,
		title: 'Appcelerator',
		image:"http://media.tumblr.com/tumblr_m1hzbmMNrs1qznie6.jpg",
		phone:'+1-650-200-4255'
	},
	{
		latitude: 37.331689,
		longitude: -122.030731,
		title: 'Apple',
		image:"http://www.bangor.ac.uk/itservices/office365/images/apple.png",
		phone:'+1-800-692-7753'
	},
	{
		latitude: 37.422502,
		longitude: -122.0855498,
		title: 'Google',
		image:"https://cdn1.iconfinder.com/data/icons/yooicons_set01_socialbookmarks/512/social_google_box.png",
		phone:'+1-855-492-5538'
	}
];


//Loop through locations and add them to the map and the table
for(var i in data){
	
	annotations.push(Map.createAnnotation({latitude:data[i].latitude, longitude:data[i].longitude, title:data[i].title, animated:true}));
	var row =  Alloy.createController('partials/locationRow', {data: data[i], index: i}).getView();
	locations.push(row);
	
}
$.table.setData(locations);
mapview.setAnnotations(annotations);
$.mapView.add(mapview);


function tblClick(e){
	Alloy.Globals.apm.leaveBreadcrumb("tblClick()"); 
	Ti.Analytics.featureEvent('BusinessClicked');
	
	mapview.setRegion({latitude:annotations[e.row.index].latitude, longitude:annotations[e.row.index].longitude, latitudeDelta:0.1, longitudeDelta:0.1});
	mapview.selectAnnotation(annotations[e.row.index]);
}

$.topBar.back.addEventListener('click',closeWindow);
$.topBar.setTitle('Mapping');

/**
 * Closes the window 
 * */
function closeWindow(){
	(OS_IOS) ? Alloy.Globals.navGroup.closeWindow($.mapWin): $.mapWin.close();
}
