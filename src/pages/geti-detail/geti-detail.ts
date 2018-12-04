import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { LishiPage } from '../lishi/lishi'
import { HuoweiPage } from '../huowei/huowei'

// import { ConfirmRukuPage } from '../confirm-ruku/confirm-ruku'
/**
 * Generated class for the RukuqitaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-geti-detail',
  templateUrl: 'geti-detail.html',
})
export class GetiDetailPage {
  ruku_info: any = {}
  shouhuo_mode = false
  zhuangtai_dict = {
  'zaiku': '正常在库',
  'daijiance': '即将检测',
  'daibaofei': '即将报废',
  'jianceguoqi': '过期未检测',
  'baofeiguoqi': '过期未报废',
  'chuku': '已出库',
  'baofei': '已报废',
  'yiku': '移库中'}
  // TODO: ruku_info 更改变量名

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GetiDetailPage')
    this.shouhuo_mode = this.navParams.data.mode == 'shouhuo'
    this.refresh()
  }

  refresh() {
    let code = this.navParams.data.code
    let self = this
    rpc(this, "wms.geti", "info", [code],
      {}, {success: res => {
        if (res.data.result.length == 0) {
          self.presentToast("没有找到此备件")
          self.navCtrl.pop()
          return
        }
        // TODO: 允许查询到多个备件
        self.ruku_info = res.data.result[0]
        self.ruku_info['shiyongshebei'] = self.ruku_info['shiyongshebei'].join(',')
        if (self.shouhuo_mode && (self.ruku_info.is_own || ['chuku', 'yiku'].indexOf(self.ruku_info.zhuangtai) == -1)) {
          //收货模式，但该备件是自己的，或该备件不在出库状态
          // TODO: 收货完成回显时不进行pop返回
          self.presentToast("此备件不需要收货")
          self.navCtrl.pop()
          return
        }
      }
    })
  }

  view_lishi(){
    this.navCtrl.push(LishiPage, {geti_id: this.ruku_info.id}, {animate: true})
  }

  chuku_tap() {
    let self = this
    const prompt = this.alertCtrl.create({
      title: '填写出库去向',
      message: "若出库用于某一设备，请填写设备编号；若出库移动至其他仓库，请写目的仓库名称。",
      inputs: [
        {
          name: 'yongtu',
          placeholder: '设备编号或仓库名称'
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
          text: '确认出库',
          handler: data => {
            //
            rpc(self, "wms.geti", "phone_chuku", [self.ruku_info.id, data.yongtu], {}, {
              success() {
                self.refresh()
                self.presentToast('出库完成！')
              }
            })
          }
        }
      ]
    });
    prompt.present();
  }

  huiku_tap(){
    // TODO: 回库时可创建货位
    let self = this
    let alert = this.alertCtrl.create();
    alert.setTitle('选择回库货位');
    alert.setMessage('回库到原仓库：' + this.ruku_info.cangku)
    rpc(this, "wms.huowei", "search_read",
    [[['kucuncelue','=',this.ruku_info.kucuncelue]],["bianma"]], {}, {
      success(res) {
        res.data.result.forEach(r => {
          alert.addInput({
            type: 'radio',
            label: r.bianma,
            value: r.id,
          })
        })
        alert.addButton('取消');
        alert.addButton({
          text: '确定回库',
          handler: (data: any) => {
            console.log('Radio data:', data);
            if (!data) {
              self.presentToast('请选择货位')
              return
            }
            rpc(self, "wms.geti", "phone_huiku", [self.ruku_info.id, data], {}, {
              success() {
                self.refresh()
                self.presentToast('回库完成！')
              }
            })
          }
        });

        alert.present();
      }
    })
  }

  shouhuo_tap() {
    let self = this
    this.navCtrl.push(HuoweiPage, {
      beijianext: this.ruku_info.beijianext,
      id: this.ruku_info.beijianext_id,
      mode: 'shouhuo',
      geti_id: this.ruku_info.id,
      callback: () => { self.refresh() }
    }, {animate: true})
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
