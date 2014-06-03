//Initialization Parameters
var annotations = [];
var locations = [];
var currentLoc = Alloy.Globals.currentLoc;
var data = [];

//Setup V2 Maps Module
var Map = (OS_IOS || OS_ANDROID) ? require("ti.map") : Ti.Map;
var mapview = Map.createView({
	mapType : Map.NORMAL_TYPE
});

/**
 * Map screen Initialization
 **/
function initialize() {
	//annotations data
	data = [currentLoc, {
		latitude : 37.389569,
		longitude : -122.050212,
		title : 'Appcelerator',
		subtitle:"440 Bernardo Ave",
		image : "http://media.tumblr.com/tumblr_m1hzbmMNrs1qznie6.jpg",
		phone : '+1-650-200-4255'
	}, {
		latitude : 37.331689,
		longitude : -122.030731,
		title : 'Apple',
		image : "http://www.bangor.ac.uk/itservices/office365/images/apple.png",
		phone : '+1-800-692-7753'
	}, {
		latitude : 37.422502,
		longitude : -122.0855498,
		title : 'Google',
		image : "https://cdn1.iconfinder.com/data/icons/yooicons_set01_socialbookmarks/512/social_google_box.png",
		phone : '+1-855-492-5538'
	}];

	//adding all locations to table
	addLocationsToTable(data);

	//adding map to mapview with annotations
	addMap();

	//show closest location
	setTimeout(function() {
		if (currentLoc) {
			var closestLoc = findClosest(data);
			alert(closestLoc + L('closestLoc').toString());
		}
	}, 500);

}

/**
 * HELPER METHODS
 */

/**
 * finds the closest location
 */
function findClosest(data) {
	var closestData = data.slice();
	closestData.shift();
	var closest = require("closest");
	return closest(currentLoc.latitude, currentLoc.longitude, closestData).title;
}

/**
 * Add Locations to the table
 */
function addLocationsToTable(data) {
	//Loop through locations and add them to the map and the table
	for (var i in data) {
		var row;
		if (data[i] && data[i] !== null) {
			annotations.push(Map.createAnnotation({
				latitude : data[i].latitude,
				longitude : data[i].longitude,
				title : data[i].title,
				subtitle:data[i].subtitle || "",
				animated : true
			}));
			row = Alloy.createController('partials/locationRow', {
				data : data[i],
				index : i,
				hasLoc : true
			}).getView();
			//	add long press event on row click for adding into Contacts
			if (OS_IOS || OS_ANDROID) {
				row.addEventListener( OS_IOS ? "longpress" : "longclick", addContact);
				row.addEventListener("touchend", tblClick);
			} else {
				row.addEventListener("click", tblClick);
			}

			locations.push(row);
		} else {
			row = Alloy.createController('partials/locationRow', {
				data : {
					title : L('location_unavailable')
				},
				index : -1,
				hasLoc : false
			}).getView();
			locations.push(row);
		}

	}
	$.table.setData(locations);
}

/**
 * add Contacts to Phonebook
 **/
function addContact(params) {
	Alloy.Globals.apm.leaveBreadcrumb("map:addContact()");
	Ti.Analytics.featureEvent('BussinessAddedAsContact');

	if (OS_IOS || OS_ANDROID) {

		if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_AUTHORIZED) {
			performAddressBookFunction();
		} else if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_UNKNOWN) {
			Ti.Contacts.requestAuthorization(function(e) {
				if (e.success) {
					performAddressBookFunction();
				} else {
					alert(L('accessDenied').toString());
				}
			});
		} else {
			alert(L('accessDenied').toString());
		}

		function performAddressBookFunction() {
			var contactData = data[params.row.index];
			if (contactData.title && contactData.phone) {
				if (Ti.Contacts.getPeopleWithName(contactData.title).length == 0) {
					Ti.Contacts.createPerson({
						firstName : contactData.title,
						phone : {
							work : [contactData.phone]
						}
					});
				}

				var callAlert = Ti.UI.createAlertDialog({
					title : contactData.title + L("save_contacts"),
					message : L("wouldCall").toString() + contactData.title + L("now").toString() + contactData.phone,
					buttonNames : [L("no").toString(), L("call").toString()]
				});
				callAlert.show();
				callAlert.addEventListener("click", function(e) {
					if (e.index == 1) {
						if (Ti.Platform.model == "Simulator") {
							alert(L("simulatorErr").toString()+ contactData.phone);
						} else {
							Ti.Platform.openURL("tel:" + contactData.phone);
						}
					}
				});
			}
		}

	}
}

/**
 * Add Map to Mapview
 **/
function addMap() {
	mapview.setAnnotations(annotations);
	mapview.setRegion({
		latitude : annotations[0].latitude,
		longitude : annotations[0].longitude,
		latitudeDelta : 0.5,
		longitudeDelta : 0.5
	});
	$.mapView.add(mapview);
}

/**
 * EVENT LISTENERS
 * */
/**
 * Marks the location on map
 */
function tblClick(e) {
	Alloy.Globals.apm.leaveBreadcrumb("map:tblClick()");
	Ti.Analytics.featureEvent('BusinessClicked');

	var index = this.index;

	if (annotations.length < locations.length) {
		index -= 1;
	}
	if (this.hasLoc) {
		mapview.setRegion({
			latitude : annotations[index].latitude,
			longitude : annotations[index].longitude,
			latitudeDelta : 0.5,
			longitudeDelta : 0.5
		});
		mapview.selectAnnotation(annotations[index]);
	}

}

/**
 * Closes the window
 * */
function closeWindow() {
	$.mapWin.close();
}

initialize();

$.topBar.imageContainer.addEventListener('click', closeWindow);
$.topBar.setTitle(L('mapping'));
