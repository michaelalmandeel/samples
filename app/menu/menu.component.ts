import { Component, OnInit , ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MenuDataSourceService } from '../menu-data-source.service';
import { ComponentCommunicationService } from '../component-communication.service';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { footerData } from '../app.component';
import { Animation, AnimationController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { promise } from 'protractor';

export interface menuItem
{
  section:string;
  title:string;
  price:number;
  image:string;
  description:string;
  mods:{ groupName:string,defaultItem:{itemName:string,price:number},maxChoices:number,items:{itemName:string,price:number}[] }[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  @ViewChild('grid',{read:ElementRef}) grid:ElementRef;

  search:boolean = false;
  query:string;
  tempSection:string;
  tempMenu:menuItem[];

  async openLoading(input:string)
  {
    const loading = await this.loadingController.create({message: "searching: "+input,mode:'ios'});
    await loading.present();
  }

  closeLoading(){this.loadingController.dismiss()}

 async enterSearch(input:string):Promise<void>
  {
    if(input === ''){return}

    await this.openLoading(input);

    let resultArray:menuItem[] = [];

    input = input.toLowerCase();

    for(let i = 0; i < this.menuItemArray.length; i++)
    {
      if( this.menuItemArray[i].title.toLowerCase().includes(input) ){  resultArray.push(this.menuItemArray[i]) }
      
    }
    this.closeLoading();
    if(resultArray.length === 0){return;}

    this.search = true;
    this.tempMenu = this.menuItemArray;
    this.tempSection = this.sectionId;

    this.menuItemArray = resultArray;
    this.sectionId = 'Results';
    


  }

  exitSearch():void
  { 
    this.menuItemArray = this.tempMenu; 
    this.sectionId = this.tempSection; 
    this.search = false; 
  }


  menuItemArray: menuItem[];
  sectionId:string;
  showModal:boolean = false;
  currentItem:menuItem;
  bagVisable:boolean = false;
  footerdata:footerData = {title:'', leftIcons:[ { icon:'arrow-undo', func:(() => this.changeSection(false)) },{icon:'arrow-redo', func:(() => this.changeSection(true)) } ], rightIcons:[ { icon:'list-outline', func:(() => {this.isGallery = false; this.setFooter();}) }]};
  sections:string[];
  isGallery:boolean = false;
  outAnimation:Animation;
  inAnimation:Animation;
  forward:boolean;

  openModal(item:menuItem):void{ this.currentItem = item; this.showModal = true; }

  closeModal():void{this.showModal = false}

  hideBag(){ this.bagVisable = false }

  constructor(public loadingController:LoadingController,private ccs:ComponentCommunicationService ,private mds:MenuDataSourceService, private router: Router,private animationCtrl: AnimationController){}

  changeSectionAnimation(section:string):void
  {
    if(this.forward){
      this.outAnimation = this.animationCtrl.create()
      .addElement(this.grid.nativeElement)
      .duration(360)
      .iterations(1)
      .fromTo('transform', 'translateX(0%)', 'translateX(-100%)');
  
      this.inAnimation = this.animationCtrl.create()
      .addElement(this.grid.nativeElement)
      .duration(900)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'translateX(100%)' },
        { offset: 0.4, transform: 'translateX(100%)' },
        { offset: 0.85, transform: 'translateX(-1%)' },
        { offset: 1, transform: 'translateX(0%)' }
      ]);
    }
    else{
      this.outAnimation = this.animationCtrl.create()
      .addElement(this.grid.nativeElement)
      .duration(360)
      .iterations(1)
      .fromTo('transform', 'translateX(0%)', 'translateX(100%)');
  
      this.inAnimation = this.animationCtrl.create()
      .addElement(this.grid.nativeElement)
      .duration(900)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'translateX(-100%)' },
        { offset: 0.4, transform: 'translateX(-100%)' },
        { offset: 0.85, transform: 'translateX(1%)' },
        { offset: 1, transform: 'translateX(0%)' }
      ]);
      this.forward = true;
    }

     this.outAnimation.play().then(() => { if(this.search === true){this.exitSearch()} this.sectionId = section; this.inAnimation.play(); });
  }

  swapViewAnimation():void
  {
    this.outAnimation = this.animationCtrl.create()
    .addElement(this.grid.nativeElement)
    .duration(360)
    .iterations(1)
    .fromTo('transform', 'translateX(0%)', 'translateX(-100%)');
  
    this.inAnimation = this.animationCtrl.create()
    .addElement(this.grid.nativeElement)
    .duration(900)
    .iterations(1)
    .keyframes([
      { offset: 0, transform: 'translateX(100%)' },
      { offset: 0.4, transform: 'translateX(100%)' },
      { offset: 0.85, transform: 'translateX(-1%)' },
      { offset: 1, transform: 'translateX(0%)' }
    ]);

    (this.isGallery ? this.outAnimation.play().then(() => { this.isGallery = false; this.inAnimation.play().then(() => this.setFooter()); })
    : this.outAnimation.play().then(() => { this.isGallery = true; this.inAnimation.play().then(() => this.setFooter()); }));
  }

  changeSection(forward:boolean)
  {
    if(this.sections === undefined){return}
    if(this.search){this.forward = forward;this.ccs.setSectionSubject(this.tempSection);return;}
    this.forward = forward;
    let i:number;
    this.sections.forEach((element,index) => element === this.sectionId ? i = index : {} );
    if(forward){ ( i === this.sections.length-1 ? this.ccs.setSectionSubject(this.sections[0]) : this.ccs.setSectionSubject(this.sections[++i]) ); }
    else{ ( i === 0 ? this.ccs.setSectionSubject(this.sections[this.sections.length-1]) : this.ccs.setSectionSubject(this.sections[--i]) ); }
  }

  setFooter():void
  {
    this.footerdata.title = this.sectionId; 
    if(this.isGallery){ this.footerdata.rightIcons = [ { icon:'list-outline', func:() => this.swapViewAnimation() } ]; }
    else{ this.footerdata.rightIcons = [ { icon:'apps', func:() => this.swapViewAnimation() } ]; }
    this.ccs.setFooterSubject(this.footerdata); 
  }

  toString():string{return 'menu'}

  ngOnInit()
  { 
    this.mds.getMenuItems().then((data) => { 
                                              this.menuItemArray = data; 
                                              //this.sectionId = this.menuItemArray[0].section;
                                              this.ccs.subscribeSectionSubject( (x) => 
                                              {
                                               if(!this.sectionId){ this,this.sectionId = x;return;}
                                               x === this.sectionId ? {}: this.changeSectionAnimation(x);
                                              }, this.menuItemArray[0].section );
                                              this.setFooter();
                                              const searchFunc = this.enterSearch.bind(this);
                                              this.ccs.subscribeSearchSubject(searchFunc);
                                           }, (err) => console.log(err));

    this.mds.getMenuSections().then((data) => {
                  this.sections = data;
                  this.router.events.subscribe(event => { if (event instanceof ActivationEnd){ if(event.snapshot.component.toString() === 'menu'){ ( () => this.setFooter() )() } } });
                }); 


  }

}
