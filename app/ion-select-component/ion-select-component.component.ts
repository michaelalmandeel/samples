import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ion-select-component',
  templateUrl: './ion-select-component.component.html',
  styleUrls: ['./ion-select-component.component.scss'],
})
export class IonSelectComponentComponent {
  @Input() currentItem:{groupName:string,defaultItem:{itemName:string,price:number},maxChoices:number,items:{itemName:string,price:number}[] };
  @Output() onSelected = new EventEmitter<{itemName:string,price:number}>();

  fireEvent(value:{itemName:string,price:number}):void{this.onSelected.emit({itemName:value.itemName,price:value.price});}

  compareWith(o1:{itemName:string,price:number}, o2:{itemName:string,price:number}) {
    return o1.itemName === o2.itemName;
  }

  constructor(){}

}
