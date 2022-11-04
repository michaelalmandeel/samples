import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { MenuButtonComponent } from './menu-button/menu-button.component';
import { ModalComponentComponent } from "./modal-component/modal-component.component"


@NgModule({
  declarations: [MenuComponent,MenuButtonComponent,ModalComponentComponent],
  imports: [
    CommonModule
  ]
})
export class MenuModuleModule { }
