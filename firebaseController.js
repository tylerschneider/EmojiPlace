var locationsRef = firebase.database().ref('locationData/');
var locationsDataArray = [];
function locationsRef.on('value', function(snapshot) {
	snapshotToArray(snapshot);
	updateLocations();
});

function snapshotToArray(snapshot){
	var locationArray = [];
	snapshot.forEach(function(childSnapshot){
		var item = childSnapshot.val();
		locationArray.push(item);
	});
	locathionsDataArray = loccationArray;
}