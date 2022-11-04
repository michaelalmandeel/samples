import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { menuItem } from '../menu/menu.component';
import { ComponentCommunicationService } from '../component-communication.service';
import { orderItem } from '../component-communication.service';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-component.component.html',
  styleUrls: ['./modal-component.component.scss'],
})
export class ModalComponentComponent implements OnInit {
  @Input() currentItem:menuItem;
  @Output() onClose = new EventEmitter();
  
  myOrder:orderItem = {title:'',price:0,instructions:'',options:[]};
  order:{instructions:string,options:{itemName:string,price:number}[]}
  qty:number = 1;

  setOptions( options:{itemName:string,price:number} , index:number ):void{this.order.options[index] = options; console.log("name: "+options.itemName+" price: "+options.price);}
  
  setInstructions(instructions:any):void{this.order.instructions = instructions.target.value;console.log("instructions = "+instructions.target.value); }
 
  fireEvent():void{this.onClose.emit()}
  
  sendOrder():void
  {
    this.myOrder.title = this.currentItem.title;
    this.myOrder.price = this.currentItem.price;
    this.myOrder.instructions = this.order.instructions;
    this.order.options.forEach((val) => { 
                                          if(val.itemName != "None")
                                          {
                                          this.myOrder.options.push(val.itemName); 
                                          this.myOrder.price += val.price;
                                          }
                                        });
    this.ccs.addOrderItem(this.myOrder,this.qty);
    this.fireEvent();
  }

  incrementQty():void
  {
    this.qty++;
  }

  decrementQty():void
  {
    if(this.qty === 1){ return}
    this.qty--;
  }

  constructor(private ccs:ComponentCommunicationService){}


  ngOnInit() 
  {
    this.order = {instructions:"",options:[]};
    for(let p of this.currentItem.mods)
    {
      this.order.options.push({itemName:p.defaultItem.itemName,price:p.defaultItem.price});
    }

  }

}
