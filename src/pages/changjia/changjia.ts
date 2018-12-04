import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';


/**
 * Generated class for the ChangjiaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-changjia',
  templateUrl: 'changjia.html',
})
export class ChangjiaPage {
  // beijianext_title: string = 'ZPW.CE'
  find_result = []
  // beijianext: number
  show_create: boolean
  allow_create: boolean
  new_changjia_name: string = ''
  new_changjia_city: string = ''
  selected_index = 'none'
  // huowei_format: string = ''
  // placeholder_value
  // placeholder_types
  // gen_huowei: string

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    let self = this
    this.storage.get('userinfo').then(userinfo => {
      userinfo = userinfo || {'uid': 0}
      rpc(self, 'res.users','can_add_cangjia', [userinfo.uid], {}, {
        success: res => {
          self.allow_create = res.data.result
        }
      })
      self.refresh_changjia_list(() => {
        let temp_selected: any = this.dbid_to_findid(this.navParams.get('changjia'))
        temp_selected = temp_selected == -1 ? 'none' : temp_selected
        self.selected_index = temp_selected
      })
    })
    console.log('ionViewDidLoad HuoweiPage');
  }

  dbid_to_findid (dbid) {
    let ind = -1
    this.find_result.forEach((r,i) => {
      console.log(JSON.stringify(r))
      if (r.id == dbid) {
        ind = i
      }
    })
    return ind
    // const radio_filter = self.find_result.filter(r => {
    //   return r.id == temp_selected
    // })
    // if (radio_filter.length > 0) {
    //   self.selected_index = radio_filter[0]
    // }
  }

  refresh_changjia_list(success) {
    let bjid = this.navParams.get('bjid')
    rpc(this, "wms.changjia", "search_read",
      [[["beijian", "=", bjid]], ["id", "name", "city"]],
      {}, {success: res => {
        this.show_create = res.data.result.length < 1
        this.find_result = res.data.result
        // console.log(JSON.stringify(this.find_result))
        if (success) {
          success()
        }
      }
    })
  }

  create_changjia() {
    let self = this
    if (!this.new_changjia_city || this.new_changjia_city.length == 0) {
      this.presentToast("必须填写城市")
      return
    }
    if (!this.new_changjia_name || this.new_changjia_name.length == 0) {
      this.presentToast("必须填写厂家名称")
      return
    }
    rpc(this, "wms.changjia", "create",
      [{"name": this.new_changjia_name, "city": this.new_changjia_city,
      "beijian": this.navParams.get('bjid')}],
      {}, {success: res => {
        self.refresh_changjia_list(null)
      }
    })
  }

  radio_checked(e) {
    let id = false
    let name = ''
    if (e != 'none') {
      console.log('radio checked',e)
      name = this.find_result[e].name
      id = this.find_result[e].id
    }
    this.navParams.data.callback(id, name)
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
