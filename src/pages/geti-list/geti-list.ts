import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { GetiDetailPage } from '../geti-detail/geti-detail'

/**
 * Generated class for the LishiPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-geti-list',
  templateUrl: 'geti-list.html',
})
export class GetiListPage {
  find_result = []

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    // TODO: 历史记录多行遮挡问题解决
    // TODO: 时区问题
    let self = this
    console.log('ionViewDidLoad GetiDetailPage')
    let beijianext_id = this.navParams.data.id
    this.storage.get('cangku').then(cangku => {
      rpc(this, "wms.geti", "search_read",
        [[['beijianext','=',beijianext_id], ['cangku', '=', cangku], ['zhuangtai', 'in', ['zaiku', 'daijiance', 'daibaofei']]], ['xuliehao', 'cangku']],
        {}, {
          success(res){
            self.find_result = res.data.result
          }
        })
      })
  }

  show_detail (res) {
    this.navCtrl.push(GetiDetailPage, {code: res, mode: 'chaxun'}, {animate: true})
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
