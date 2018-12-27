import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { LishiPage } from '../lishi/lishi'
import { HuoweiPage } from '../huowei/huowei'
import { BLE } from '@ionic-native/ble'

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
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController,
    private ble: BLE) {
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
          // TODO: 这个逻辑不是很对，车间账户通过这个方法没法调拨
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

  print_btn() {
    // TODO: BLE 优化
    let self = this
    this.storage.get("ble_devid")
    .then(ble_devid => {
      ble_devid = ble_devid || ""
      if (ble_devid == "") {
        let loading = self.loadingCtrl.create({
          content: '搜索蓝牙中'
        })
        loading.present()
        self.ble.scan(['F7666711-0699-4EE9-8D9F-9C1FCB55BBAB'], 5)
        .subscribe(function(device){
          self.ble.stopScan()
          .then(function(){
            loading.dismiss()
            self.ble.connect(device.id)
            .subscribe(function(){
              console.log('connected')
              self.storage.set('ble_devid', device.id)
              self.ble.write(device.id, 'F7666711-0699-4EE9-8D9F-9C1FCB55BBAB',
                'd62d4799-a440-4f01-a183-733e97a4b160',
                self.stringToByte(self.ruku_info.xuliehao))
                .then(function(){
                  console.log("write success")
                  self.ble.disconnect(device.id).then(()=>console.log("disconnect success"))
                  .catch(err=>console.log("disconnect failuer", JSON.stringify(err)))
                }).catch(function(){
                  console.log("Write failuer")
                  self.ble.disconnect(device.id).then(()=>console.log("disconnect success"))
                  .catch(err=>console.log("disconnect failuer", JSON.stringify(err)))
                })
            }, function(){
              console.log('disconnect')
            })
          })
        }, error => {
          console.log("failuer scan ble")
        })
      } else {
        self.ble.connect(ble_devid)
        .subscribe(function(){
          console.log('connected')
          self.ble.write(ble_devid, 'F7666711-0699-4EE9-8D9F-9C1FCB55BBAB',
            'd62d4799-a440-4f01-a183-733e97a4b160',
            self.stringToByte(self.ruku_info.xuliehao))
            .then(function(){
              console.log("write success")
              self.ble.disconnect(ble_devid).then(()=>console.log("disconnect success"))
              .catch(err=>console.log("disconnect failuer", JSON.stringify(err)))
            }).catch(function(){
              console.log("Write failuer")
              self.ble.disconnect(ble_devid).then(()=>console.log("disconnect success"))
              .catch(err=>console.log("disconnect failuer", JSON.stringify(err)))
            })
        }, function(){
          console.log('disconnect')
        })
      }
    })
  }

  reset_ble () {
    this.storage.set("ble_devid", '')
  }

  stringToByte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(((c >> 18) & 0x07) | 0xF0);
        bytes.push(((c >> 12) & 0x3F) | 0x80);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(((c >> 12) & 0x0F) | 0xE0);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(((c >> 6) & 0x1F) | 0xC0);
        bytes.push((c & 0x3F) | 0x80);
      } else {
        bytes.push(c & 0xFF);
      }
    }
    let buf = new ArrayBuffer(bytes.length)
    let dv = new DataView(buf)
    for (i=0;i<dv.byteLength;i++) {
      dv.setUint8(i, bytes[i])
    }
    return buf
  }

}
