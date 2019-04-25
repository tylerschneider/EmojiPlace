import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

  moreEmojis: any = [
  	"smile2",
	"neutral2",
	"disappointed2",
	"rage",
	"heart2"
  ]

  emojiSelected: string;

  constructor(private router: Router) { }

  ngOnInit() {
  }

	smileButton() {
		if(this.emojiSelected != "smile2")
		{
			this.emojiSelected = "smile2";
			this.changeOpacity();		
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}
	
	neutralButton() {
		if(this.emojiSelected != "neutral2")
		{
			this.emojiSelected = "neutral2";
			this.changeOpacity();
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}
	
	disappointedButton() {
		if(this.emojiSelected != "disappointed2")
		{
			this.emojiSelected = "disappointed2";
			this.changeOpacity();		
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}	
	
	rageButton() {
		if(this.emojiSelected != "rage")
		{
			this.emojiSelected = "rage";
			this.changeOpacity();		
		}
		else
		{
			this.emojiSelected = null;
			this.changeOpacity();
		}
	}
	
	heartButton() {
		if(this.emojiSelected != "heart2")
		{
			this.emojiSelected = "heart2";
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
		if(this.emojiSelected != null){
			if(this.emojiSelected == "smile2")
			{
				this.emojiSelected = "smile";
			}
			if(this.emojiSelected == "neutral2")
			{
				this.emojiSelected = "neutral";
			}			
			if(this.emojiSelected == "disappointed2")
			{
				this.emojiSelected = "disappointed";
			}			
			if(this.emojiSelected == "heart2")
			{
				this.emojiSelected = "heart";
			}
			this.router.navigate(['../home', { id: this.emojiSelected }]);		
		}
		else
		{
			this.router.navigate(['../home']);
		}

	}
}
