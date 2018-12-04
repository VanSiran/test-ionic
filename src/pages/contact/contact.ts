import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble'
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController, private ble: BLE) {
  }

  ionViewDidLoad () {

  }

  ble_btn() {
    let self = this
    this.ble.scan(['F7666711-0699-4EE9-8D9F-9C1FCB55BBAB'], 5)
    .subscribe(function(device){
      self.ble.stopScan()
      .then(function(){
        self.ble.connect(device.id)
        .subscribe(function(){
          console.log('connected')
          self.ble.write(device.id, 'F7666711-0699-4EE9-8D9F-9C1FCB55BBAB',
            'd62d4799-a440-4f01-a183-733e97a4b160',
            self.stringToByte("181120000056"))
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
