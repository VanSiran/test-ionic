import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
// import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { rpc } from '../../libs/api';
import { RukuPage } from '../ruku/ruku'
import { LoginPage } from '../login/login'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  current_cangku: string = ''

  constructor(public navCtrl: NavController, private storage: Storage,
    /*private barcodeScanner: BarcodeScanner,*/ private http: HTTP,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController) {

  }

  ionViewDidLoad () {
    let self = this
    this.storage.get('userinfo')
    .then(userinfo => {
      userinfo = userinfo || {"uid": false}
      if (userinfo.uid !== false) {
        rpc({navCtrl: this.navCtrl, loadingCtrl: this.loadingCtrl, http: this.http, toastCtrl: this.toastCtrl, storage: this.storage},
          "res.users", "read", [[userinfo.uid], ["name", "cangku"]], {}, {success: e => {
            self.current_cangku = e.data.result[0].cangku[1]
            this.storage.set('cangku', e.data.result[0].cangku[0])
          },  session_expire: () => {
            self.navCtrl.push(LoginPage, {}, {animate: false}) // TODO: add no back param
            // wx.redirectTo({
            //   url: '/pages/login/login?no_main=0',
            // })
          }
        })
      } else {
        self.navCtrl.push(LoginPage, {}, {animate: false}) // TODO: add no back param
      }
    })
  }

  logout_tap () {
    let self = this
    this.storage.get('userinfo')
    .then(userinfo => {
      userinfo = userinfo || { "session_id": false, "login": false, "password": false, 'uid': false }

      let loading = self.loadingCtrl.create({
        content: ''
      });
      loading.present();
      let data = {
        'jsonrpc': '2.0',
        'params': { }
      }
      self.http.post('http://47.95.8.185/web/session/destroy', data, {
        'content-type': 'application/json',
        'cookie': "session_id=" + userinfo.session_id
      }).then(r => {
        loading.dismiss()
        console.log(JSON.stringify(r))
      })
      userinfo.session_id = false
      userinfo.password = false
      this.storage.set('userinfo', userinfo)
      self.navCtrl.push(LoginPage, {}, {animate: false}) // TODO: add no back param
    })
  }

  ruku_tap () {
    this.navCtrl.push(RukuPage, {}, {animate: true})
  }

  scan_tap () {
    (<any>window).plugins.GMVBarcodeScanner.scan({}, (err,res)=>{
      console.log(JSON.stringify([res, err]))
    })
  }

  cangku_tap () {

  }
}
