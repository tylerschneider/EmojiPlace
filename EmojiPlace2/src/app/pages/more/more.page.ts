import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

  moreEmojis: any = [
  	"smiley",
	"neutral",
	"disappointed",
	"rage",
	"heart"
  ]

  emojiSelected: string;

  constructor(private router: Router, private modalController: ModalController) { }

  ngOnInit() {
  }

	smileyButton() {
		if(this.emojiSelected != "smiley"){
			this.emojiSelected = "smiley";		
		}else{
			this.emojiSelected = null;
        }
        this.changeOpacity();
	}
	
	neutralButton() {
        if (this.emojiSelected != "neutral") {
            this.emojiSelected = "neutral";
        } else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
    }
	
	disappointedButton() {
        if (this.emojiSelected != "disappointed") {
            this.emojiSelected = "disappointed";
        } else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
    }	
	
	rageButton() {
        if (this.emojiSelected != "rage") {
            this.emojiSelected = "rage";
        } else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
    }
	
	heartButton() {
        if (this.emojiSelected != "heart") {
            this.emojiSelected = "heart";
        } else {
            this.emojiSelected = null;
        }
        this.changeOpacity();
    }

	changeOpacity() {
		if(this.emojiSelected == null)
		{
			this.moreEmojis.forEach(e => {
				document.getElementById(e).style.opacity = '1';			
			});
		}
		else 
		{
			this.moreEmojis.forEach(e => {
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

	selectEmoji(){
        this.modalController.dismiss(this.emojiSelected);
	}
}
