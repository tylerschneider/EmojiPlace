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
      "heart",
      "burger",
      "basketball",
      "camera",
      "music",
      "tree",
      "taco",
      "pizza",
      "eggplant",
      "chicken",
      "ramen",
      "icecream",
      "cutlery",
      "egg",
      "beer",
      "graduation",
      "controller",
      "football",
      "atm",
      "tiger",
      "fish",
      "thumbsup",
      "thumbsdown",
      "highheel",
      "skull",
      "barber",
      "poop",
      "grin",
      "laughingwhilecrying",
      "sunglasses",
      "meh",
      "winktongue",
      "angry",
      "tear",
      "sad",
      "surprised",
      "grimace",
      "crying",
      "smile",
      "frown",
      "no",
      "shoppingcart",
      "thinking",
      "star",
      "raisedeyebrow"
  ]

  emojiSelected: string;

  constructor(private router: Router, private modalController: ModalController) { }

  ngOnInit() {
  }

    smileyButton() { this.setEmoji("smiley"); }
	
	neutralButton() { this.setEmoji("neutral"); }
	
	disappointedButton() { this.setEmoji("disappointed"); }	
	
	rageButton() { this.setEmoji("rage"); }
	
	heartButton() { this.setEmoji("heart"); }

    burgerButton() { this.setEmoji("burger"); }

    basketballButton() { this.setEmoji("basketball"); }

    cameraButton() { this.setEmoji("camera"); }

    musicButton() { this.setEmoji("music"); }

    treeButton() { this.setEmoji("tree"); }

    tacoButton() { this.setEmoji("taco"); }

    pizzaButton() { this.setEmoji("pizza"); }

    eggplantButton() { this.setEmoji("eggplant"); }

    chickenButton() { this.setEmoji("chicken"); }

    ramenButton() { this.setEmoji("ramen"); }

    icecreamButton() { this.setEmoji("icecream"); }

    cutleryButton() { this.setEmoji("cutlery"); }

    eggButton() { this.setEmoji("egg"); }

    beerButton() { this.setEmoji("beer"); }

    graduationButton() { this.setEmoji("graduation"); }

    controllerButton() { this.setEmoji("controller"); }

    footballButton() { this.setEmoji("football"); }

    atmButton() { this.setEmoji("atm"); }

    tigerButton() { this.setEmoji("tiger"); }

    fishButton() { this.setEmoji("fish"); }

    dogButton() { this.setEmoji("dog"); }

    thumbsupButton() { this.setEmoji("thumbsup"); }

    thumbsdownButton() { this.setEmoji("thumbsdown"); }

    highheelButton() { this.setEmoji("highheel"); }

    skullButton() { this.setEmoji("skull"); }

    barberButton() { this.setEmoji("barber"); }

    poopButton() { this.setEmoji("poop"); }

    grinButton() { this.setEmoji("grin"); }

    laughingwhilecryingButton() { this.setEmoji("laughingwhilecrying"); }

    sunglassesButton() { this.setEmoji("sunglasses"); }

    mehButton() { this.setEmoji("meh"); }

    winktongueButton() { this.setEmoji("winktongue"); }

    angryButton() { this.setEmoji("angry"); }

    tearButton() { this.setEmoji("tear"); }

    sadButton() { this.setEmoji("sad"); }

    surprisedButton() { this.setEmoji("surprised"); }

    grimaceButton() { this.setEmoji("grimace"); }

    cryingButton() { this.setEmoji("crying"); }

    smileButton() { this.setEmoji("smile"); }

    frownButton() { this.setEmoji("frown"); }

    noButton() { this.setEmoji("no"); }

    shoppingcartButton() { this.setEmoji("shoppingcart"); }

    thinkingButton() { this.setEmoji("thinking"); }

    starButton() { this.setEmoji("star"); }

    raisedeyebrowButton() { this.setEmoji("raisedeyebrow"); }

    setEmoji(e)
    {
        if (this.emojiSelected != e) {
            this.emojiSelected = e;
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
