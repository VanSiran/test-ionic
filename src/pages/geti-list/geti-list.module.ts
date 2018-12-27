import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GetiListPage } from './geti-list';

@NgModule({
  declarations: [
    GetiListPage,
  ],
  imports: [
    IonicPageModule.forChild(GetiListPage),
  ],
})
export class GetiListPageModule {}
