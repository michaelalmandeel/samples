import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { MenuListElementComponent } from './menu-list-element/menu-list-element.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ComponentCommunicationService } from './component-communication.service';
import { MenuDataSourceService } from './menu-data-source.service';
import { MenuComponent } from './menu/menu.component';
import { ArraySearchPipePipe } from './array-search-pipe.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment'
import { ModalComponentComponent } from './modal-component/modal-component.component';
import { IonSelectComponentComponent } from './ion-select-component/ion-select-component.component';
import { ShoppingBagComponent } from './shopping-bag/shopping-bag.component';


@NgModule({
  declarations: [AppComponent,MenuComponent,MenuListElementComponent,ArraySearchPipePipe,ModalComponentComponent,IonSelectComponentComponent,ShoppingBagComponent],
  entryComponents: [],
  imports: [BrowserModule,IonicModule.forRoot(),AppRoutingModule, ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: environment.production,
  // Register the ServiceWorker as soon as the app is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
}), ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: environment.production,
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
})],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },ComponentCommunicationService,MenuDataSourceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
