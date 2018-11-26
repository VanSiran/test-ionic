import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
// import { Camera, CameraOptions } from '@ionic-native/camera'
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions,
  CameraPreviewDimensions } from '@ionic-native/camera-preview';
import { rpc } from '../../libs/api';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { HuoweiPage } from '../huowei/huowei'
/**
 * Generated class for the RukuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ruku',
  templateUrl: 'ruku.html',
})
export class RukuPage {
  input_mode: string = 'recognize'
  beijianext_input = {'manual':''}
  find_result = []

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private cameraPreview: CameraPreview, private loadingCtrl: LoadingController,
    private  toastCtrl: ToastController, private storage: Storage, private http: HTTP) {
  }

  ionViewDidLoad() {
    const elem = document.getElementById('camera-top')
    const ypos = elem.offsetTop + elem.offsetHeight

    console.log("位置", elem.offsetTop, elem.offsetHeight)
    let height: number = Math.floor(window.screen.width * 0.5)
    this.cameraPreview.startCamera({y: ypos, height: height, camera: 'rear'})
    .then(
      (res) => {
        console.log(res)
      },
      err => {
        console.log(err)
      }
    )
    // this.cameraPreview.setOnPictureTakenHandler().subscribe(result => {
    //   console.log(result)
    // })
    console.log('ionViewDidLoad RukuPage');
  }

  ionViewWillEnter () {
    this.cameraPreview.show()
  }

  ionViewWillLeave () {
    this.cameraPreview.hide()
  }

  search_beijianext (res) {
    let self = this
    const beijianext = this.beijianext_input[res]
    if (beijianext == "") {
      return
    }
    console.log(JSON.stringify(this.beijianext_input))
    rpc({navCtrl: this.navCtrl, loadingCtrl: this.loadingCtrl, http: this.http, toastCtrl: this.toastCtrl, storage: this.storage},
      "wms.beijianext", "find_similar", [0, beijianext], {}, {success: res => {
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
    this.navCtrl.push(HuoweiPage, bj, {animate: true})
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
