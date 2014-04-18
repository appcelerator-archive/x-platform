function getClosestStation(myLat,myLon,data) {
	var distances = [];
	var sortedDistances = [];
	for (var i in data) {
		data[i].distance =  distance(myLat, myLon, data[i].latitude, data[i].longitude);
		distances.push(data[i].distance);
		sortedDistances.push(data[i].distance);
	}
	
	sortedDistances.sort();
	return data[distances.indexOf(sortedDistances[0])];
}

function distance(myLat, myLon, lat, lon) {
	var dx = myLat - lat;
	var dy = myLon - lon;
	var dist = Math.sqrt(dx*dx + dy*dy);

	return dist;
}

module.exports = getClosestStation;