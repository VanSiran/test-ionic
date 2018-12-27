import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController,
  ToastController, AlertController } from 'ionic-angular';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { BLE } from '@ionic-native/ble'

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
  xuliehao = ""

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private  toastCtrl: ToastController,
    private storage: Storage, private http: HTTP, public alertCtrl: AlertController,
    private ble: BLE) {
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
          // console.log(JSON.stringify())
          self.xuliehao = res.data.result.xuliehao
          self.ruku_complete = true
        }
      })
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
                self.stringToByte(self.xuliehao))
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
            self.stringToByte(self.xuliehao))
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
