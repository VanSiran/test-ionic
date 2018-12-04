import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';

import { ChangjiaPage } from '../changjia/changjia'
import { ConfirmRukuPage } from '../confirm-ruku/confirm-ruku'
/**
 * Generated class for the RukuqitaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rukuqita',
  templateUrl: 'rukuqita.html',
})
export class RukuqitaPage {
  beijianext_title: string = ''
  changjia_name: string = ''
  changjia_id = false
  need_test: boolean
  changbianhao_text = ''
  shengchanriqi_date = (new Date()).toISOString().split("T")[0]
  shangcijiance_date = (new Date()).toISOString().split("T")[0]
  pihao_text = ''

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    this.beijianext_title = this.navParams.get('beijianext')
    this.need_test = this.navParams.get('jiancebaojing')
    // this.shengchanriqi_date = ''
    // this.shangcijiance_date = ''
  }

  select_changjia(id, name) {
    let param = this.navParams.data
    let self = this
    param['callback'] = function(id, name) {
      self.changjia_id = id
      self.changjia_name = name
      console.log(self.changjia_id, self.changjia_name)
    }
    param['changjia'] = this.changjia_id
    this.navCtrl.push(ChangjiaPage, param, {animate: true})
  }

  confirm_btn() {
    if (this.shengchanriqi_date == '') {
      this.presentToast('请输入生产日期')
      return
    }
    if (this.need_test && this.shangcijiance_date == '') {
      this.presentToast('请输入上次检测日期')
      return
    }
    
    let param = this.navParams.data
    param['changbianhao'] = this.changbianhao_text
    param['shengchanriqi'] = this.shengchanriqi_date
    param['shangcijiance'] = this.shangcijiance_date
    param['pihao'] = this.pihao_text
    param['changjia'] = this.changjia_id
    param['changjia_name'] = this.changjia_name

    this.navCtrl.push(ConfirmRukuPage, param, {animate: true})
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 1500,
      position: 'top',
      // cssClass: ''
    });
    toast.present();
  }

}
