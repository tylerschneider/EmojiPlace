import { Component, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FirebaseService } from '../services/firebase.service';
import { Location } from '../models/location.model';
import 'rxjs-compat/add/operator/map';
import { Observable } from 'rxjs-compat/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';

declare var google;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    //find the element on the home page
    @ViewChild('map') mapElement: ElementRef;

    //get locations from the database
    locationsList$: Observable<Location[]>;

    //variables
    map: any;
    position: any;
    locationKey: any;
    currentLoc: any;
    markerPlaced: boolean;
    placeMarker: any;
    latLng: any;
	leftPage: boolean = false;

	emojiSelected: string;

    GoogleAutocomplete: any;
    autocomplete: string;
    autocompleteItems: any = [];
    geocoder: any;

    //what information is held in Location
    location: Location = {
        emoji: '',
        latitude: 0,
        longitude: 0
    }

	emojis: any = [
	"smile",
	"neutral",
	"disappointed",
	"heart"
	]


    constructor(private router: Router, private geolocation: Geolocation,
        public firebaseService: FirebaseService, public zone: NgZone, public alertCtrl: AlertController, public activatedRoute: ActivatedRoute) {
        this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
            return changes.map(c => ({
                key: c.payload.key, ...c.payload.val()
            }));
        });
    }

	ngOnInit() {
        this.geolocation.getCurrentPosition().then(pos => {

            //find the user's position
            let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

            let mapOptions = {
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                clickableIcons: false,

                //set map center to user's position
                center: latLng
            }

            //create map
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

            //create the autocomplete service, input, and array for predictions 
            this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
            this.autocomplete = '';
            this.autocompleteItems = [];
            this.geocoder = new google.maps.Geocoder;

            //add event listener to the map to look for taps/clicks, which will place a marker
            google.maps.event.addListener(this.map, 'click', (event) => {
                this.markerClick(this.map, event.latLng);
            });

            //add a marker at center (user's location) on load
            this.markerClick(this.map, latLng);

			}).catch((error) => {
				console.log('Error getting location', error);
			});

        //add markers for each item in the database (?)
       /* this.firebaseService.getLocationsList().valueChanges().subscribe(res => {
            for (let item of res) {
                this.addMarker(item);
                this.position = new google.maps.LatLng(item.latitude, item.longitude);
                this.map.setCenter(this.position);
            }
        });*/
    }

	ionViewDidEnter(){

		var em = this.activatedRoute.snapshot.paramMap.get('id');
		 
		if(em != null)
		{
			this.emojiSelected = em;
			console.log(this.emojiSelected + " 123");
			this.changeOpacity();
		}		
	}

    updateSearchResults() {
        //check if the search input is empty
        if (this.autocomplete == '') {
            this.autocompleteItems = [];
            return;
        }
        this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete },
            (predictions, status) => {
                this.autocompleteItems = [];
                this.zone.run(() => {
                    //make sure there are predictions available, without this it will have an error
                    if (predictions != null) {
                        predictions.forEach((prediction) => {
                            this.autocompleteItems.push(prediction);
                        });
                    }
                });
            });
    }

    selectSearchResult(item) {
        this.autocompleteItems = [];

        this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
            /*if (status === 'OK' && results[0]) {
                var resultPos = new google.maps.LatLng(results[0].geometry.location.lat, results[0].geometry.location.lng);
            }*/

            this.map.setCenter(results[0].geometry.location);
            this.markerClick(this.map, results[0].geometry.location);
        });
    }
    

    markerClick(map, location) {
        //make sure there's already a marker placed. If not, it will make a new one
        if (!this.markerPlaced) {
            this.placeMarker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP,
            draggable: true
            });
            this.markerPlaced = true
        }
        else {
            //reset the marker by removing and re-adding it so that it's drop animation will replay
            this.placeMarker.setMap(null);
            this.placeMarker.setAnimation(null);
            this.placeMarker.setAnimation(google.maps.Animation.DROP);
            this.placeMarker.setMap(this.map);
            //Use setTimeout to delay move and prevent flicker
            setTimeout(() => {
                this.placeMarker.setPosition(location);
            }, 100);

        }
    }

    addMarker(location: any) {
        let latLng = new google.maps.LatLng(location.latitude, location.longitude);
        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: latLng
        });

       // this.addInfoWindow(marker, location);
    }
    /*
    onContextChange(ctxt: string): void {
        this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
            return changes.map(c => ({
                key: c.payload.key, ...c.payload.val()
            }));
        });
    }*/

    /*assignLocation(loc: Location) {
        this.firebaseService.setCurrentLocation(loc);
        this.currentLoc = loc;
        this.locationKey = loc.key;
        this.locationTitle = loc.title;
        console.log("Assigned location key: " + this.locationKey);
    }*/

    /*addInfoWindow(marker, location) {
        let contentString = '<div class="info-window" id="clickableItem" >' +
            '<h3>' + location.title + '</h3>' +
            '<div class="info-content">' +
            '<img src="' + location.picture + '" style="width:30px;height:30px;border-radius: 50%; padding: 20px, 20px, 20px, 20px;"/>' +
            '<p>' + location.content + '</p>' +
            '</div>' +
            '</div>';

        let infoWindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 400
        });

        google.maps.event.addListener(infoWindow, 'domready', () => {
            var clickableItem = document.getElementById('clickableItem');
            clickableItem.addEventListener('click', () => {
                console.log("clicked on marker");
                this.firebaseService.setCurrentLocation(location);
                this.locationTitle = location.title;
                this.router.navigate(['/list', this.locationTitle]);
            });
        });
        google.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
        });
        google.maps.event.addListener(this.map, 'click', () => {
            infoWindow.close(this.map, marker);
        });
    }*/

	moreButton() {
		this.emojiSelected = null;
		this.changeOpacity();
		this.leftPage = true;
	}

	smileButton() {
		if(this.emojiSelected != "smile")
		{
			this.emojiSelected = "smile";
			this.changeOpacity();		
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}
	
	neutralButton() {
		if(this.emojiSelected != "neutral")
		{
			this.emojiSelected = "neutral";
			this.changeOpacity();		
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}
	
	disappointedButton() {
		if(this.emojiSelected != "disappointed")
		{
			this.emojiSelected = "disappointed";
			this.changeOpacity();		
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}
	
	heartButton() {
		if(this.emojiSelected != "heart")
		{
			this.emojiSelected = "heart";
			this.changeOpacity();		
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}

	changeOpacity() {
		if(this.emojiSelected == null)
		{
			this.emojis.forEach(e => {
				document.getElementById(e).style.opacity = '1';
			});
		}
		else 
		{
			this.emojis.forEach(e => {
				if( e != this.emojiSelected)
				{
					document.getElementById(e).style.opacity = '0.5';
					console.log("here");
				}
				else
				{
					document.getElementById(e).style.opacity = '1';		
				}
			});
		}
	}

    addEmoji() {
	console.log(this.emojiSelected);
		if (this.emojiSelected == null)
		{
			this.showAlert();

		}
		else
		{
			this.location.emoji = this.emojiSelected,
			this.location.latitude = this.placeMarker.getPosition().lat();
			this.location.longitude = this.placeMarker.getPosition().lng();

			this.firebaseService.addLocation(this.location);	
			console.log(this.emojiSelected);
		}
    }

	async showAlert(){
		let alertPopup = await this.alertCtrl.create({
				header: 'Alert',
				message: 'Please Select An Emoji',
				buttons: ['OK']
			});

			return await alertPopup.present();
	}
}