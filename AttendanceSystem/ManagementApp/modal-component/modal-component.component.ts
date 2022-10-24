import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-component.component.html',
  styleUrls: ['./modal-component.component.scss'],
})
export class ModalComponentComponent 
{
  @Input() log:string[];
  @Output() onClose = new EventEmitter();
 
  fireEvent():void{this.onClose.emit()}

  constructor(){}
}
