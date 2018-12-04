import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LishiPage } from './lishi';

@NgModule({
  declarations: [
    LishiPage,
  ],
  imports: [
    IonicPageModule.forChild(LishiPage),
  ],
})
export class LishiPageModule {}
