import { Component, Input, OnInit , Output , ViewChild , ElementRef , EventEmitter } from '@angular/core';
import { menuItem } from '../menu/menu.component';
import { Animation, AnimationController } from '@ionic/angular';


@Component({
  selector: 'app-menu-list-element',
  templateUrl: './menu-list-element.component.html',
  styleUrls: ['./menu-list-element.component.scss'],
})

export class MenuListElementComponent implements OnInit {

  @Input() item:menuItem;
  @ViewChild('content',{read:ElementRef}) content:ElementRef;
  @ViewChild('InnerContent',{read:ElementRef}) innerContent:ElementRef;
  @Output() openModal:EventEmitter<menuItem> = new EventEmitter<menuItem>();

  open:boolean = false;
  myAnimation:Animation;
  currentIcon:string = "caret-down";

  constructor(private animationCtrl: AnimationController){}

  onClick():void{ this.openModal.emit(this.item)}

  toggleListItem():void
  {
    if(this.open)
    {
      this.myAnimation = this.animationCtrl.create()
      .addElement(this.content.nativeElement)
      .duration(300)
      .iterations(1)
      .fromTo('height', this.innerContent.nativeElement.offsetHeight+"px", '0px');
      this.currentIcon = "caret-down";
      this.myAnimation.play().then(() => { this.open = false;});
    }
    else
    {
      this.myAnimation = this.animationCtrl.create()
      .addElement(this.content.nativeElement)
      .duration(300)
      .iterations(1)
      .fromTo('height', '0px', this.innerContent.nativeElement.offsetHeight+"px");
      this.currentIcon = "caret-up";
      this.myAnimation.play().then(() => { this.open = true;});
    }
  }

  ngOnInit() {}

}
