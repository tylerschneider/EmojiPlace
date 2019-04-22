import { Component, OnInit } from '@angular/core';
import { Location } from '../../models/location.model';
import { FirebaseService } from '../../services/firebase.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
    public base64Image: string;
    location: Location = {
        content: '',
        latitude: 0,
        longitude: 0,
        title: '',
        picture: ''
    }

    constructor(private geolocation: Geolocation, public firebaseService: FirebaseService) { }

  ngOnInit() {
      this.geolocation.getCurrentPosition().then(pos => {
          this.location.latitude = pos.coords.latitude,
              this.location.longitude = pos.coords.longitude;
      });
  }

}
