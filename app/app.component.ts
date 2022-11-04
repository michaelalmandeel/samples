import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuDataSourceService } from './menu-data-source.service';
import { ComponentCommunicationService } from './component-communication.service';
import { RouterOutlet , Router } from '@angular/router';

export interface footerData
{
  title:string;
  leftIcons:{icon:string , func:() => void}[];
  rightIcons:{icon:string , func:() => void}[];
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent 
{
  @ViewChild('mainOutlet') outlet:RouterOutlet;
  @ViewChild('searchbar', {read:ElementRef}) searchbar:ElementRef;
  menuSections:string[];
  footData:footerData = {title:'',leftIcons:[],rightIcons:[]};
  bagQty:number = 0;
  query:string = '';
  bagVisable:boolean = false;

  openBag(){this.bagVisable = true}
  hideBag(){this.bagVisable = false}

  onSearchInput(searchterm:any):void
  { 
    if(searchterm.target.value.length > 22)
    {
      searchterm.target.value = searchterm.target.value.substring(0,22);
    }

    this.query = searchterm.target.value; 
  }

  search():void{ this.router.navigate(['/menu']); this.ccs.setSearchSubject(this.query); this.query = ''; this.searchbar.nativeElement.value = '';}

  setSection(str:string)
  {
    this.ccs.setSectionSubject(str); 
    if(this.outlet.component.toString() === 'menu'){return}
    this.router.navigateByUrl('/menu');
  }
  
  constructor(private mds:MenuDataSourceService, private ccs:ComponentCommunicationService,private router:Router)
  { 
    mds.getMenuSections().then((data) => this.menuSections = data);
    ccs.subscribeFooterSubject((data) => this.footData = data);
    ccs.subscribeQuantitySubject((qty) => this.bagQty = qty);
  }
}
