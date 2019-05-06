var map, placeMarker, infoWindow, locationTitle, locationSeperator, locationAddress;
var initialPos = {
	lat: 43.6038,
	lng: -116.2032
};
var range = 0.0005;
var locations = [];

function initMap(){
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		streetViewControl: false,
		fullscreenControl: false,
		clickable: true,
		center: initialPos
	});
	
	infoWindow = new google.maps.InfoWindow();
	
	var infowindowContent = document.getElementById('infowindow-content');
  infoWindow.setContent(infowindowContent);
	
	infowindowContent.children['place-name'].textContent = '';	
	infowindowContent.children['place-address'].textContent =
			"";
	
	infoWindow.open(map);

	
	var service = new google.maps.places.PlacesService(map);
	
	google.maps.event.addListener(map, 'click', function(event) {

		if(event.placeId)
		{
			infoWindow.close();
			event.stop();
			//var place = event.placeId;
			
			var request = {
			  placeId: event.placeId,
			  fields: ['name', 'formatted_address', 'place_id', 'geometry']
			};
				
			
			service.getDetails(request, function(result, status){
				if (status !== google.maps.places.PlacesServiceStatus.OK) {
				window.alert('PlacesService failed due to: ' + status);
				return;
			  }

			  map.setCenter(result.geometry.location);

			  markerClick(map, result.geometry.location);

			  infowindowContent.children['place-name'].textContent = result.name;	

			  infowindowContent.children['place-address'].textContent =
				  result.formatted_address;

			  infoWindow.open(map, placeMarker);
				
			  findEmoji(result.name, result.formatted_address, result.geometry.location);
			});

		}
		else
		{
			infoWindow.close();
			event.stop();

			infowindowContent.children['place-name'].textContent = '';	
			infowindowContent.children['place-address'].textContent =
			"";
			
			markerClick(map, event.latLng);	
			
			findEmoji('This Location', '', event.latLng);
			
			infoWindow.close();
		}

	});
	
	
	markerClick(map, initialPos);
	
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(function(position) 
		{
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            map.setCenter(pos);
			markerClick(map, pos);
        });									 
	} 
	
  var input = document.getElementById('search');

  var autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.bindTo('bounds', map);

  // Specify just the place data fields that you need.
  autocomplete.setFields(['place_id', 'geometry', 'name', 'formatted_address']);

  var geocoder = new google.maps.Geocoder();
	
  /*placeMarker.addListener('click', function() {
    infoWindow.open(map, placeMarker);
  });*/

  autocomplete.addListener('place_changed', function() {
    infoWindow.close();
    var place = autocomplete.getPlace();

    if (!place.place_id) {
      return;
    }
    geocoder.geocode({'placeId': place.place_id}, function(results, status) {
      if (status !== 'OK') {
        window.alert('Geocoder failed due to: ' + status);
        return;
      }

      map.setCenter(results[0].geometry.location);
		
	  markerClick(map, results[0].geometry.location);

      infowindowContent.children['place-name'].textContent = place.name;
      infowindowContent.children['place-address'].textContent =
          results[0].formatted_address;

      infoWindow.open(map, placeMarker);
		
	  findEmoji(place.name, results[0].formatted_address, results[0].geometry.location);
    });
  });

}

/*, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
}*/



   function markerClick(map, location) {
        //make sure there's already a marker placed. If not, it will make a new one
        if (this.placeMarker == null) {
            this.placeMarker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP,
            draggable: false,
            icon: { url: "../images/marker.svg", scaledSize: new google.maps.Size(30, 40) },
            zIndex: 2
            });
        }
        else {
            //reset the marker by removing and re-adding it so that it's drop animation will replay
            this.placeMarker.setMap(null);
            this.placeMarker.setAnimation(null);
            this.placeMarker.setAnimation(google.maps.Animation.DROP);
            this.placeMarker.setMap(this.map);
            //Use setTimeout to delay move and prevent flicker. This is Google's fault (sorry Google)
            setTimeout(function() {
                this.placeMarker.setPosition(location);
            }, 100);
        }
    }

function updateLocations(){
	var arrayLength = locationsDataArray.length;
	//var pos;
	for (var i=0; i<arrayLength; i++){
		placeEmoji(map, locationsDataArray[i]);
		//map.setCenter(pos);
		//map.setZoom(15);
		locations.push(locationsDataArray[i]);
	}
	console.log(locations);
}

function findEmoji(title, address, location){
	locationTitle = document.getElementById("location-title");
	locationTitle.innerHTML = title;
	locationSeperator = document.getElementById("location-seperator");
	if(title == "This Location")
	{
		locationSeperator.innerHTML = "";			
	}
	else
	{
		locationSeperator.innerHTML = "|";		
	}

	locationAddress = document.getElementById("location-address");
	locationAddress.innerHTML = address;
	
	for(var ind = 0; ind < 7; ind++)
	{
		document.getElementById("emoji" + ind).innerHTML = "";
		document.getElementById("number" + ind).innerHTML = "";			
	}

	
	var emojiArray = [];
	
	var arrayLength = locations.length;
	//var pos;
	for (var i=0; i<arrayLength; i++){
		if(locations[i].latitude < location.lat() + range && locations[i].latitude > location.lat() - range && locations[i].longitude < location.lng() + range && locations[i].longitude > location.lng() - range)
		{
				emojiArray.push(locations[i].emoji);
		}
	}
	
	emojiArray.sort();
	
	var counts = {};
	
	emojiArray.forEach(function(element) { counts[element] = (counts[element] || 0) +1;
	});
	
	var j = 0;
	
	for (var element in counts){
		console.log(element + " " + counts[element]);
		document.getElementById("emoji" + j).innerHTML = "<img src=" + getEmojiImage(element).toString() + " alt=" + element + ">" ;
		document.getElementById("number" + j).innerHTML = counts[element];
		j++;
		if(j>6)
			{
				break;
			}
	}
}

function placeEmoji(map, location){
	var pos = {
		lat: location.latitude,
		lng: location.longitude
	};
	
	var e = location.emoji;
	
	var icon = getEmojiImage(e);
										
        var marker = new google.maps.Marker({
            position: pos,
            icon: { url: icon, scaledSize: new google.maps.Size(25, 25)},
            map: map,
            clickable: false,
            zIndex: -1
        });
}

function getEmojiImage(e){
	var p = 'https://twemoji.maxcdn.com/2/svg/';
        var s = '.svg';
	    var icon;

        // =-=-=-=-=-=-=-=-=-=-=-=-=<| Image sources for emojis |>=-=-=-=-=-=-=-=-=-=-=-=-= \\

        if (e == "smiley")
        {
            icon = p + '1f603' + s;
        }
        if (e == "neutral") {
            icon = p + '1f610' + s;
        }
        if (e == "disappointed") {
            icon = p + '1f61e' + s;
        }
        if (e == "heart") {
            icon = p + '2764' + s;
        }
        if (e == "rage") {
            icon = p + '1f621' + s;
        }
        if (e == "burger") {
            icon = p + '1f354' + s;
        }
        if (e == "basketball") {
            icon = p + '1f3c0' + s;
        }
        if (e == "camera") {
            icon = p + '1f3a5' + s;
        }
        if (e == "music") {
            icon = p + '1f3b5' + s;
        }
        if (e == "tree") {
            icon = p + '1f332' + s;
        }
        if (e == "taco") {
            icon = p + '1f32e' + s;
        }
        if (e == "pizza") {
            icon = p + '1f355' + s;
        }
        if (e == "eggplant") {
            icon = p + '1f346' + s;
        }
        if (e == "chicken") {
            icon = p + '1f357' + s;
        }
        if (e == "ramen") {
            icon = p + '1f35c' + s;
        }
        if (e == "icecream") {
            icon = p + '1f366' + s;
        }
        if (e == "cutlery") {
            icon = p + '1f374' + s;
        }
        if (e == "egg") {
            icon = p + '1f373' + s;
        }
        if (e == "beer") {
            icon = p + '1f37a' + s;
        }
        if (e == "graduation") {
            icon = p + '1f393' + s;
        }
        if (e == "controller") {
            icon = p + '1f3ae' + s;
        }
        if (e == "football") {
            icon = p + '1f3c8' + s;
        }
        if (e == "atm") {
            icon = p + '1f3e7' + s;
        }
        if (e == "tiger") {
            icon = p + '1f42f' + s;
        }
        if (e == "fish") {
            icon = p + '1f41f' + s;
        }
        if (e == "dog") {
            icon = p + '1f415' + s;
        }
        if (e == "thumbsup") {
            icon = p + '1f44d' + s;
        }
        if (e == "thumbsdown") {
            icon = p + '1f44e' + s;
        }
        if (e == "highheel") {
            icon = p + '1f460' + s;
        }
        if (e == "skull") {
            icon = p + '1f480' + s;
        }
        if (e == "barber") {
            icon = p + '1f488' + s;
        }
        if (e == "poop") {
            icon = p + '1f4a9' + s;
        }
        if (e == "grin") {
            icon = p + '1f601' + s;
        }
        if (e == "laughingwhilecrying") {
            icon = p + '1f602' + s;
        }
        if (e == "sunglasses") {
            icon = p + '1f60e' + s;
        }
        if (e == "meh") {
            icon = p + '1f615' + s;
        }
        if (e == "winktongue") {
            icon = p + '1f61c' + s;
        }
        if (e == "angry") {
            icon = p + '1f620' + s;
        }
        if (e == "tear") {
            icon = p + '1f622' + s;
        }
        if (e == "sad") {
            icon = p + '1f626' + s;
        }
        if (e == "surprised") {
            icon = p + '1f62e' + s;
        }
        if (e == "grimace") {
            icon = p + '1f62c' + s;
        }
        if (e == "crying") {
            icon = p + '1f62d' + s;
        }
        if (e == "smile") {
            icon = p + '1f642' + s;
        }
        if (e == "frown") {
            icon = p + '1f641' + s;
        }
        if (e == "no") {
            icon = p + '1f6ab' + s;
        }
        if (e == "shoppingcart") {
            icon = p + '1f6d2' + s;
        }
        if (e == "thinking") {
            icon = p + '1f914' + s;
        }
        if (e == "star") {
            icon = p + '2b50' + s;
        }
        if (e == "raisedeyebrow") {
            icon = p + '1f928' + s;
        }
	
	return icon;
}
	
	/*var contentString = '<div class="info-window" id="clickableItem" > ' + '<h3>' + location.title + '</h3>' + '<div class="info-content">' + location.picture + 'alt="picture" style="width:30px; height=30px; padding:20px, 20px, 20px, 20px;">' + '<p>' + location.content + '</p>' + '</div>' + '</div>';
	var infoWindow = new google.maps.InfoWindow({
		content: contentString,
		maxWidth: 400
	});
	marker.addListener('click', function(){
		infoWindow.open(map, marker);
	});
	google.maps.event.addListener(infoWindow, 'domready', function(){
		var clickableItem = document.getElementById('clickableItem');
		clickableItem.addEventListener('click', () => {
		loadViewPage(location);
		});
	});
}

function loadViewPage(location){
	localStorage.setItem("currentLocTitle", location.title);
	localStorage.setItem("currentLocContent", location.content);
	localStorage.setItem("currentLocPicture", location.picture);
	
	window.location = "info.html";
}*/