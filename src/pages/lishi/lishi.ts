import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';

/**
 * Generated class for the LishiPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lishi',
  templateUrl: 'lishi.html',
})
export class LishiPage {
  find_result = []

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    // TODO: 历史记录多行遮挡问题解决
    let self = this
    console.log('ionViewDidLoad GetiDetailPage')
    let geti_id = this.navParams.data.geti_id
    rpc(this, "wms.lishijilu", "search_read",
      [[['geti_id','=',geti_id]], ['xinxi', 'create_date', 'create_uid']],
      {order: 'create_date asc'}, {
        success(res){
          self.find_result = res.data.result
        }
      })
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
