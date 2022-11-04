import { Injectable } from '@angular/core';
import { ReplaySubject, Subject , BehaviorSubject } from 'rxjs';
import { footerData } from './app.component';

export interface orderItem
{
  title:string;
  options:string[];
  instructions:string;
  price:number;
}

export interface uniqueOrderItem
{
  key:number;
  item:orderItem
}

@Injectable({
  providedIn: 'root'
})
export class ComponentCommunicationService {

private searchSubject:ReplaySubject<string> = new ReplaySubject<string>(1);

private sectionIdSubject:BehaviorSubject<string>;

private footerSubject:Subject<footerData> = new Subject<footerData>();

private orderSubject:ReplaySubject<uniqueOrderItem[]> = new ReplaySubject<uniqueOrderItem[]>(1);

private quantitySubject:Subject<number> = new Subject<number>();

private orders:uniqueOrderItem[] = [];

private myKey:number = 0;

public addOrderItem(item:orderItem,qty:number):void
{ 
  let myItem:uniqueOrderItem;
  for(let i = 0; i < qty;i++)
  {
  myItem = {key: this.myKey++,item: item};
  this.orders.push(myItem);
  }
  this.quantitySubject.next(this.orders.length);
  this.orderSubject.next(this.orders);
}

public removeOrderItem(key:number):void
{
  let temp:uniqueOrderItem[] = [];
  this.orders.forEach((j) => { if(j.key != key){temp.push(j)} } );
  this.orders = temp;
  this.quantitySubject.next(this.orders.length);
  this.orderSubject.next(this.orders);
}

public subscribeOrderSubject(func:any):void{ this.orderSubject.subscribe(func) }

public subscribeQuantitySubject(func:any):void{ this.quantitySubject.subscribe(func) }

public setSectionSubject(str:string){ this.sectionIdSubject.next(str);}

public subscribeSectionSubject(func:any,init:string)
{ 
  if(this.sectionIdSubject)
  {
    this.sectionIdSubject.subscribe(func);
    return; 
  }
  
  this.sectionIdSubject = new BehaviorSubject<string>(init);
  this.sectionIdSubject.subscribe(func);
  return;
}

public setFooterSubject(footerdata:footerData){ this.footerSubject.next(footerdata) }

public subscribeFooterSubject(func:any){ this.footerSubject.subscribe(func) }

public setSearchSubject(input:string):void{ this.searchSubject.next(input) }

public subscribeSearchSubject(func:any){ this.searchSubject.subscribe(func) }

constructor(){}
}
