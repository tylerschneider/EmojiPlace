import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FirebaseService } from '../services/firebase.service';
import { Location } from '../models/location.model';
import 'rxjs-compat/add/operator/map';
import { Observable } from 'rxjs-compat/Observable';
import { Router } from '@angular/router';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    @ViewChild('map') mapElement: ElementRef;
    public base64Image: string;
    locationsList$: Observable<Location[]>;
    map: any;
    position: any;
    public locationTitle: string;

    constructor(private router: Router, private geolocation: Geolocation, public firebaseService: FirebaseService) {
        this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
            return changes.map( c=> ({
                key: c.payload.key, ...c.payload.val()
            }));
        });
    }

    ngOnInit() {
        let mapOptions = {
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullScreenControl: false
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.firebaseService.getLocationsList().valueChanges().subscribe(res => {
            for (let item of res) {
                this.addMarker(item)
                this.position = new google.maps.LatLng(item.latitude, item.longitude);
                this.map.setCenter(this.position);
            }
        });
    }

    onContextChange(ctxt: string): void {
        this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
            return changes.map(c => ({
                key: c.payload.key, ...c.payload.val()
            }));
        });
    }

    addMarker(location: any){
        let latLng = new google.maps.LatLng(location.latitude, location.longitude);
        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: latLng
        });

        this.addInfoWindow(marker, location);
    }

    addInfoWindow(marker, location) {
        let contentString = '<div class="info-window" id="clickableItem" > ' + '<h3>' + location.title + '</h3>' + '<div class="info-content">' + location.picture + 'alt="picture" style="width:30px; height=30px; padding:20px, 20px, 20px, 20px;">' + '<p>' + location.content + '</p>' + '</div>' + '</div>';

        let infoWindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 400
        });

        google.maps.event.addListener(infoWindow, 'domready', () => {
            var clickableItem = document.getElementById('clickableItem');
            clickableItem.addEventListener('click', () => {
                this.firebaseService.setCurrentLocation(location);
                this.locationTitle = location.title;
                this.router.navigate(['/list', this.locationTitle]);
            });
        });

        google.maps.event.addListener(marker, 'click', () => {
            infoWindow.close(this.map, marker);
        });
    }
}
