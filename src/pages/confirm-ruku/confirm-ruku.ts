import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';

// import { ChangjiaPage } from '../changjia/changjia'
// import { ConfirmRukuPage } from '../confirm-ruku/confirm-ruku'
/**
 * Generated class for the RukuqitaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-confirm-ruku',
  templateUrl: 'confirm-ruku.html',
})
export class ConfirmRukuPage {
  ruku_info: any = {}
  ruku_complete = false

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmRukuPage')
    this.ruku_info = this.navParams.data
    console.log(JSON.stringify(this.ruku_info))
  }

  confirm_btn () {
    let self = this
    rpc(this, "wms.geti", "create_with_history",
      [{
        beijianext: this.navParams.data.id,
        huowei: this.navParams.data.huowei_id,
        changjia: this.navParams.data.changjia,
        shengchanriqi: this.navParams.data.shengchanriqi,
        pihao: this.navParams.data.pihao,
        changbianhao: this.navParams.data.changbianhao,
        shangcijiance: this.navParams.data.shangcijiance,
        complete_bianma: this.navParams.data.cangku_name + ' / ' + this.navParams.data.huoweiname
      }], {}, {
        success(res){
          console.log(JSON.stringify(res.data.result))
          self.ruku_complete = true
        }
      })
  }

  print_btn() {

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
