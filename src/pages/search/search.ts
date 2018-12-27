import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { GetiListPage } from '../geti-list/geti-list'

/**
 * Generated class for the RukuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  input_mode: string = 'input'
  beijianext_input = {'manual':''}
  find_result = []
  current_cangku = ''

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private alertCtrl: AlertController,
    private  toastCtrl: ToastController, private storage: Storage, private http: HTTP) {
  }

  ionViewDidLoad() {
    let self = this
    this.storage.get('cangku')
    .then(cangku => {
      cangku = cangku || 0
      // rpc(this, 'wms.cangku', 'search_read', [])
      // this.current_cangku = cangku
      rpc(self, "wms.cangku", "search_read", [[], ['name']], {}, {
        success(res) {
          res.data.result.forEach(r => {
            if (r.id == cangku) {
              self.current_cangku = r.name
            }
          })
        }
      })
    })
    console.log('ionViewDidLoad RukuPage');
  }

  cangku_tap () {
    let self = this
    let alert = this.alertCtrl.create();
    alert.setTitle('选择仓库');
    this.storage.get('cangku').then(cangku => {
      rpc(this, "wms.cangku", "search_read", [[], ['name']], {}, {
        success(res) {
          console.log(JSON.stringify(res.data.result))
          res.data.result.forEach(r => {
            alert.addInput({
              type: 'radio',
              label: r.name,
              value: r.id,
              checked: r.id == cangku
            })
          })
          alert.addButton('取消');
          alert.addButton({
            text: '确定',
            handler: (data: any) => {
              console.log('Radio data:', data);
              if (data != cangku) {
                self.current_cangku = res.data.result.filter(r=>r.id == data)[0].name
                self.storage.set('cangku', data)
              }
            }
          });

          alert.present();
        }
      })
    })
  }

  search_beijianext (res) {
    let self = this
    let beijianext = ''
    beijianext = this.beijianext_input[res]
    console.log("beijianext search:", beijianext)
    if (beijianext == "") {
      return
    }
    console.log(JSON.stringify(this.beijianext_input))
    rpc(this, "wms.beijianext", "find_similar",
      [0, beijianext], {}, {success: res => {
        if (res.data.result.length < 1) {
          this.presentToast("没有相似备品型号")
          return
        }
        this.find_result = res.data.result
      }
    })
  }

  next_step(index) {
    const bj = this.find_result[index][0]
    console.log(JSON.stringify(bj))
    this.navCtrl.push(GetiListPage, bj, {animate: true})
  }

  input_change (id, e) {
    if (e.code == 'Enter') {
      this.search_beijianext(id)
      return
    }
    this.find_result = []
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
