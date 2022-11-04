import { Component, ElementRef, EventEmitter,  OnInit, Output, ViewChildren , QueryList , AfterViewInit, ViewChild } from '@angular/core';
import { ComponentCommunicationService, orderItem } from '../component-communication.service';
import { uniqueOrderItem } from '../component-communication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping-bag',
  templateUrl: './shopping-bag.component.html',
  styleUrls: ['./shopping-bag.component.scss'],
})
export class ShoppingBagComponent implements OnInit, AfterViewInit {

  @Output() onClose = new EventEmitter();
  @ViewChildren('content',{read: ElementRef}) listItems:QueryList<any>;
  @ViewChild('list',{read: ElementRef}) myList:ElementRef;

  contents:uniqueOrderItem[] = [];
  total:number = 0;
 
  fireEvent():void{this.onClose.emit()}

  getTotal():string{ let j:Number = new Number(this.total); return j.toFixed(2); }

  getPrice(price:number):string{let j:Number = new Number(price); return j.toFixed(2);}

  myHeight:string = "0px";

  setHeight():void
  {//this function calculates the height of a scrolling list to avoid showing partial elements(better look). 
   //each element has a fixed height header, variable height content and n-1 bottom margins. 
   //we ensure our calculated height is < max height. the value is to be returned to a style binding.
   // this.listItems refers to a querylist of elementrefs that represent the elements in the list

    let totalContentHeight = 0;//to calculate running total of content height;
    let previousHeight = 0;//used to record the previous running total
    let marginHeight = 10;
    let maxHeight = 400;
    let count = 0;

    for(let i = 0; i < this.listItems.length; i++)// for each content element
    {
      previousHeight = totalContentHeight;//record total before increase
      totalContentHeight += this.listItems.get(i).nativeElement.scrollHeight;// calculate running total of content height

      if( (totalContentHeight+(i*marginHeight)) > maxHeight )//max height exceeded
      { 
        totalContentHeight = (i === 0 ? totalContentHeight : previousHeight);
        break;
      }
      count++;
    }
  this.myHeight = (totalContentHeight+(count > 0 ? (marginHeight*(count-1)) : 0 ) )+"px";//this.myHeight determines height style binding
  }

  getOverflow()
  {
    return 'visible';
  }

  getMargin(index:number,length:number):string{ return ( index === length-1 ? '0px' : '10px' ); }

  removeItem(key:number,price:number):void{ console.log(price);this.total = this.total - price; this.ccs.removeOrderItem(key) }

  checkout():void{ this.fireEvent(); }

  constructor(private ccs:ComponentCommunicationService,private router:Router){}

  ngOnInit(){ this.ccs.subscribeOrderSubject
              ( (data) => { 
                            this.contents = data; this.total = 0; 
                            this.contents.forEach((data) => {this.total += data.item.price}); 
                          } 
              ) 
            }
          
  ngAfterViewInit()
  {
    setTimeout(() => this.setHeight());
    this.listItems.changes.subscribe((listitems: QueryList<ElementRef>) => setTimeout(() => this.setHeight()));
  }

}
