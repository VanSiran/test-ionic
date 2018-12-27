import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { LoginPage } from '../pages/login/login';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { RukuPage } from '../pages/ruku/ruku';
import { HuoweiPage } from '../pages/huowei/huowei';
import { RukuqitaPage } from '../pages/rukuqita/rukuqita';
import { ChangjiaPage } from '../pages/changjia/changjia';
import { LishiPage } from '../pages/lishi/lishi';
import { ConfirmRukuPage } from '../pages/confirm-ruku/confirm-ruku';
import { GetiDetailPage } from '../pages/geti-detail/geti-detail';
import { GetiListPage } from '../pages/geti-list/geti-list';
import { SearchPage } from '../pages/search/search';

import { StatusBar } from '@ionic-native/status-bar';
import { BLE } from '@ionic-native/ble';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';

import { HTTP } from '@ionic-native/http';
// import { Camera } from '@ionic-native/camera'
import { CameraPreview } from '@ionic-native/camera-preview';
// import { BarcodeScanner } from '@ionic-native/barcode-scanner';
// import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    RukuPage,
    HuoweiPage,
    RukuqitaPage,
    ChangjiaPage,
    ConfirmRukuPage,
    GetiDetailPage,
    LishiPage,
    SearchPage,
    GetiListPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    // HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    RukuPage,
    HuoweiPage,
    RukuqitaPage,
    ChangjiaPage,
    ConfirmRukuPage,
    GetiDetailPage,
    LishiPage,
    SearchPage,
    GetiListPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP, BLE,
    CameraPreview,
    // BarcodeScanner,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
