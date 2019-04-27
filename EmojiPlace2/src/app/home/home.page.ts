import { Component, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { FirebaseService } from '../services/firebase.service';
import { Location } from '../models/location.model';
import 'rxjs-compat/add/operator/map';
import { Observable } from 'rxjs-compat/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { MorePage } from '../pages/more/more.page';

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
    camera: any;
    position: any;
    locationKey: any;
    currentLoc: any;
    placeMarker: any;
    userMarker1: any;
    userMarker2: any;
    userPos: any;
    loading: any;
    options: GeolocationOptions;

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

    //emojis that can be selected on this page
	emojis: any = [
	"smiley",
	"neutral",
	"disappointed",
	"heart"
	]

    //constructors
    constructor(private router: Router, private geolocation: Geolocation, public firebaseService: FirebaseService, private zone: NgZone, private alertCtrl: AlertController, private activatedRoute: ActivatedRoute, private modalController: ModalController, private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
        this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
            return changes.map(c => ({
                key: c.payload.key, ...c.payload.val()
            }));
        });
    }

    ngOnInit() {

        //create a loading screen to wait for the map to load
        this.showLoading();

        //options for when finding geolocation positions
        this.options = {
            timeout: 10000,
            enableHighAccuracy: true
        }

        //look for the user's position
        this.geolocation.getCurrentPosition(this.options).then(pos => {

            //assign the user's geolocation position to userPos
            this.userPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

            this.createMap(true);

        }).catch((error) => {

            //if no location found, set to the default location
            this.userPos = new google.maps.LatLng(43.6, -116.2);
            //show error message
            this.showToast(0);

            this.createMap(false);
        });

    }

    createMap(gotPos) {
        //set the map's properties
        let mapOptions = {
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,

            //set map center to user's position
            center: this.userPos
        }

        //create map
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        //create the autocomplete service, input, and array for location predictions when searching
        this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
        this.autocomplete = '';
        this.autocompleteItems = [];
        this.geocoder = new google.maps.Geocoder;

        //create event listener for if the map loaded
        google.maps.event.addListenerOnce(this.map, 'idle', (event) => {
            this.mapLoaded(this.userPos);
        });

        if (gotPos == true)
        {
            //make the user's marker
            this.makeUserMarker(this.userPos);
        }

    }

    mapLoaded(pos) {

        //once map is loaded, wait 500ms and dismiss loading screen (prevents loading screen appearing after the dismiss when the map loads quickly)
        setTimeout(() => {
            if (this.loading != null) { this.loading.dismiss(); }
        }, 500);

        //add event listener to the map to look for taps/clicks, which will place a marker
        google.maps.event.addListener(this.map, 'click', (event) => {
            this.markerClick(this.map, event.latLng);
        });

        //add a marker at center (user's location) on load
        this.markerClick(this.map, pos);

        //get emoji markers from firebase
        var items = 0
        this.firebaseService.getLocationsList().valueChanges().subscribe(res => {
            for (let item of res) {
                //use setTimeout to make emoji appear one at a time. Change number to make them appear more frequently
                setTimeout(() => { this.placeEmoji(item.emoji, item.latitude, item.longitude); }, 50 * items);
                items++
            }
        });
    }

    makeUserMarker(pos) {
        //create the first marker for the user's location (transparent blue circle)
        this.userMarker1 = new google.maps.Marker({
            position: pos,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                strokeOpacity: 0.2,
                strokeColor: '#0061fc'
            },
            clickable: false,
            zIndex: 0
        });

        //create the second marker for the user's location (solid blue circle with white outline)
        this.userMarker2 = new google.maps.Marker({
            position: pos,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillOpacity: 1,
                fillColor: '#4285f4',
                strokeColor: 'white',
                strokeWeight: 1.7,
            },
            clickable: false,
            zIndex: 1
        });

        //create subscriber to look for changes in the user's position
        this.geolocation.watchPosition(this.options).subscribe((data) => {
            console.log("watching");
            var loc = new google.maps.LatLng(data.coords.latitude, data.coords.longitude)
                //if the user moves, move the user marker to that location
                this.userMarker1.setPosition(loc);
                this.userMarker2.setPosition(loc);

        });
    }

    updateSearchResults() {
        //check if the search input is empty
        if (this.autocomplete == '') {
            this.autocompleteItems = [];
            return;
        }

        //get location predictions for search
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
        //clear prediction items when one is selected
        this.autocompleteItems = [];

        //go to the location sselected, and add a marker
        this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {

            this.map.setCenter(results[0].geometry.location);
            this.markerClick(this.map, results[0].geometry.location);
        });
    }
    

    markerClick(map, location) {
        //make sure there's already a marker placed. If not, it will make a new one
        if (this.placeMarker == null) {
            this.placeMarker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP,
            draggable: true,
            icon: { url: '../assets/marker.svg', scaledSize: new google.maps.Size(30, 40) },
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
            setTimeout(() => {
                this.placeMarker.setPosition(location);
            }, 100);
        }
    }

    centerButton() {

        //make sure there is a user marker on the stage
        if (this.userMarker1 != null) {
            //more the map and marker to the user's location
            var loc = new google.maps.LatLng(this.userMarker1.getPosition().lat(), this.userMarker1.getPosition().lng())
            this.map.setCenter(loc);
            this.markerClick(this.map, loc);
        }
        else {
            //if no user marker, find the user's location, and create the user and location markers
            this.geolocation.getCurrentPosition(this.options).then(pos => {
                var loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                this.makeUserMarker(loc);
                this.map.setCenter(loc);
                this.markerClick(this.map, loc);
            }).catch((error) => {
                //if no location found, show error
                this.showToast(0);
            });
        }

    }

    moreButton() {
        //remove emoji selection
        this.emojiSelected = null;
        //remove emoji transparency
        this.changeOpacity();
        //show the more emojis page
        this.showModal();
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=<| Buttons for emojis |>=-=-=-=-=-=-=-=-=-=-=-=-= \\

	smileyButton() {
		if (this.emojiSelected != "smiley") {
            this.emojiSelected = "smiley";
        }
        else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
	}
	
    neutralButton() {
        if (this.emojiSelected != "neutral") {
            this.emojiSelected = "neutral";
        }
        else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
    }
	
    disappointedButton() {
        if (this.emojiSelected != "disappointed") {
            this.emojiSelected = "disappointed";
        }
        else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
    }
	
    heartButton() {
        if (this.emojiSelected != "heart") {
            this.emojiSelected = "heart";
        }
        else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
    }

        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= \\

    changeOpacity() {
        //check if an emoji is not selected
		if(this.emojiSelected == null)
        {
            //remove each emoji button's transparency
			this.emojis.forEach(e => {
				document.getElementById(e).style.opacity = '1';
			});
		}
		else 
        {
            //for each emoji in the emoji array (created in OnInit), check if it matches the emoji selected and, if not, set transparency to 50%
			this.emojis.forEach(e => {
				if( e != this.emojiSelected)
				{
					document.getElementById(e).style.opacity = '0.5';
				}
				else
				{
					document.getElementById(e).style.opacity = '1';		
				}
			});
		}
	}

    addEmoji() {
        //if the add button is clicked but no emoji is selected, show alert 0
		if (this.emojiSelected == null)
		{
			this.showAlert(0);
        }
        //if the add button is clicked but no location is selected, show alert 1
        else if (this.placeMarker == null) {
            this.showAlert(1);
        }
		else
        {
            //add the emoji and lat/lng to location
			this.location.emoji = this.emojiSelected,
			this.location.latitude = this.placeMarker.getPosition().lat();
			this.location.longitude = this.placeMarker.getPosition().lng();

            //add location to the database
			this.firebaseService.addLocation(this.location);	

            //place an emoji on the map
            this.placeEmoji(this.location.emoji, this.location.latitude, this.location.longitude);

            //remove the emoji and location selected, and remove transparency from buttons
            this.emojiSelected = null;
            this.placeMarker.setMap(null);
            this.placeMarker.setAnimation(null);
            this.placeMarker = null;
            this.changeOpacity();

            //show a notification that the emoji was added
            this.showToast(1);
		}
    }

    placeEmoji(e, lat, lng) {

        var p = 'https://twemoji.maxcdn.com/2/svg/'
        var s = '.svg'
        var icon

        // =-=-=-=-=-=-=-=-=-=-=-=-=<| Image sources for emojis |>=-=-=-=-=-=-=-=-=-=-=-=-= \\

        if (e == "smiley")
        {
            icon = p + '1f603' + s
        }
        if (e == "neutral") {
            icon = p + '1f610' + s
        }
        if (e == "disappointed") {
            icon = p + '1f61e' + s
        }
        if (e == "heart") {
            icon = p + '2764' + s
        }
        if (e == "rage") {
            icon = p + '1f621' + s
        }

        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= \\

        var pos = new google.maps.LatLng(lat, lng);

        var marker = new google.maps.Marker({
            position: pos,
            icon: { url: icon, scaledSize: new google.maps.Size(20, 20)},
            map: this.map,
            clickable: false,
            zIndex: -1
        });

        marker.setOpacity(0);

        this.markerFade(marker, 0);
    }

    markerFade(m, o) {
        //if opacity is not 100%
        if (o < 1) {
           //add 2% each iteration
           o += 0.2;
           m.setOpacity(o);
           //repeat with delay for fade effect
           setTimeout(() => {
               this.markerFade(m, o);
           }, 50);
        }
    }

    async showToast(type) {
        if (type == 0) {
            //toast for no location selected
            let toast = await this.toastCtrl.create({
                message: 'Could not find location.',
                duration: 2000,
                showCloseButton: true
            });
            toast.present();
        }
        else {
            //toast for when an emoji is added
            let toast = await this.toastCtrl.create({
                message: 'Emoji added!',
                duration: 2000,
                showCloseButton: true
            });
            toast.present();
        }
    }

    async showAlert(type) {
        if (type == 0) {
            //alert for no emoji selected
		    let alertPopup1 = await this.alertCtrl.create({
				header: 'Alert',
				message: 'Please Select An Emoji',
				buttons: ['OK']
			});

			return await alertPopup1.present();
        }
        else {
            //alert for no location selected
            let alertPopup2 = await this.alertCtrl.create({
                header: 'Alert',
                message: 'Please Select A Location',
                buttons: ['OK']
            });

            return await alertPopup2.present();
        }

    }

    async showModal() {
        //create the more emoji modal from more.page
        let modal = await this.modalController.create({
            component: MorePage,
        });
        //get the emoji selected when the modal is closed and set it to emojiSelected
        modal.onDidDismiss().then(data => {
            this.emojiSelected = data['data'];
        });
        return await modal.present();
    }

    async showLoading() {
        //loading popup for when the map hasn't loaded
       this.loading = await this.loadingCtrl.create({
           message: 'Loading Map...',
           spinner: 'crescent'/*,
           duration: 15000*/
       });
       return await this.loading.present();
    }
}