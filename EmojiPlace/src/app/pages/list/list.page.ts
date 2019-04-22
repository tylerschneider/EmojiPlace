import { Component, OnInit } from '@angular/core';
import { Location } from '../../models/location.model';
import { FirebaseService } from '../../services/firebase.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
    public LocationKey: string;
    public location: Location;
    public base64Image: string;

    constructor(private geolocation: Geolocation, public firebaseService: FirebaseService) {
        this.location = this.firebaseService.getCurrentLocation();
        this.base64Image = this.location.picture
    }

    ngOnInit() {
        console.log("Got: " + this.activatedRoute.snapshot.paramMap.get('locationTitle'));
    }

    editLocation(location: Location) {
        this.firebaseService.editLocation(location);
    }
    deleteLocation(location: Location) {
        this.firebaseService.deleteLocation(location);
    }

}
