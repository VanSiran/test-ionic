import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
/**
 * Generated class for the HuoweiPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-huowei',
  templateUrl: 'huowei.html',
})
export class HuoweiPage {
  beijianext_title: string = ''
  beijianext: number
  show_create: boolean
  find_result = []
  huowei_format: string = ''
  placeholder_value
  placeholder_types
  gen_huowei: string

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    this.beijianext = this.navParams.get('id')
    this.beijianext_title = this.navParams.get('beijianext')
    this.refresh_huowei_list()

    this.storage.get('huowei_format').then(huowei_format => {
      this.huowei_format = huowei_format || "@数字-@数字-@数字"
      this.render_create_huowei()
    })

    console.log('ionViewDidLoad HuoweiPage');
  }

  render_create_huowei () {
    const placeholder_types = this.huowei_format.match(/@数字|@文字/ig)
    if (placeholder_types == null) {
      this.presentToast('货位编号格式配置错误, 只能手动输入货位')
      return
    }
    this.placeholder_value = placeholder_types.map(e => e == "@数字" ? 1 : "_")
    this.gen_huowei_str()
    this.placeholder_types = placeholder_types
  }

  refresh_huowei_list (select_huowei_id=false) {
    let self = this
    this.storage.get('cangku').then(ck => {
      rpc(this, "wms.huowei", "search_read",
        [[["beijianext", "=", this.beijianext], ["cangku", "=", ck||0]], ["bianma", "id", "cangku"]],
        {}, {success: res => {
          self.show_create = res.data.result.length < 1
          self.find_result = res.data.result
          console.log(JSON.stringify(res.data))
        }
      })
    })
  }

  gen_huowei_str () {
    const link_str = this.huowei_format.split(/@数字|@文字/ig)
    let tmp = this.placeholder_value.map((e, i) => link_str[i] + e)
    tmp.push(link_str[link_str.length-1])
    this.gen_huowei = tmp.join("")
  }

  create_huowei () {
    let self = this
    this.storage.get('cangku').then(ck => {
      rpc(this, "wms.huowei", "create_huowei_check_celue",
        [0, this.gen_huowei, ck||0, this.beijianext],
        {}, {success: res => {
          self.refresh_huowei_list(res.data.result.id)
        }, server_error: e => {
          if (e.data.error.data.exception_type == "validation_error") {
            self.presentToast("该货位号已存在，请更换其他编号")
          } else {
            self.presentToast(e.data.error.message + " (" + e.data.error.code + ")")
          }
        }
      })
    })
  }

  huowei_format_setting (){
    let self = this
    const prompt = this.alertCtrl.create({
      title: '货位格式',
      message: "‘@数字’代表数字占位<br/>‘@文字’代表文字占位<br/>其他文字代表固定格式",
      inputs: [
        {
          name: 'geshi',
          placeholder: '在此处输入格式',
          value: self.huowei_format
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '保存',
          handler: data => {
            self.huowei_format = data.geshi
            this.storage.set("huowei_format", self.huowei_format)
            this.render_create_huowei()
          }
        }
      ]
    });
    prompt.present();
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

  num_minus(i) {
    // this.placeholder_value[i]--
    this.placeholder_value[i] = this.placeholder_value[i] == 0 ? 0 : this.placeholder_value[i] - 1
    this.gen_huowei_str()
  }

  num_plus(i) {
    this.placeholder_value[i]++
    // this.placeholder_value[i] == 0 ? this.placeholder_value[i] : this.placeholder_value[i]+1
    this.gen_huowei_str()
  }

  text_input() {
    this.gen_huowei_str()
  }

}
