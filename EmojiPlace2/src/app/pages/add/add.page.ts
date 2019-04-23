import { Component, OnInit } from '@angular/core';
import { Location } from '../../models/location.model';
import { FirebaseService } from '../../services/firebase.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';


@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
    public base64Image: string;
    location: Location = {
        emoji: '',
        latitude: 0,
        longitude: 0
    }

    constructor(private geolocation: Geolocation, public firebaseService: FirebaseService) { }

    ngOnInit() {
        this.geolocation.getCurrentPosition().then(pos => {
            this.location.latitude = pos.coords.latitude;
            this.location.longitude = pos.coords.longitude;
        }).catch((error) => {
            console.log('Error getting location', error);
        });
    }
    addLocation(location: Location) {
        this.firebaseService.addLocation(location);
    }

}