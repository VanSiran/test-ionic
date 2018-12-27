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
  input_mode: string = 'input'
  beijianext_input = {'manual':''}
  find_result = []
  torch_status = false
  cam_preview_width = 0
  cam_preview_height = 0
  // cam_holder_style = ''

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private cameraPreview: CameraPreview, private loadingCtrl: LoadingController,
    private  toastCtrl: ToastController, private storage: Storage, private http: HTTP) {
  }

  ionViewDidLoad() {
    // this.bd_ocr_init()
    const elem = document.getElementById('camera-top')
    const ypos = elem.offsetTop + elem.offsetHeight
    console.log("位置", elem.offsetTop, elem.offsetHeight)
    let self = this
    this.cam_preview_height = Math.floor(window.screen.width * 0.5)
    this.cam_preview_width = window.screen.width
    this.cameraPreview.startCamera({y: ypos, height: this.cam_preview_height,
      camera: 'rear', tapPhoto: false})
    .then(
      (res) => {
        self.cameraPreview.setFlashMode('off')
        document.getElementById('cam_placeholder').style.height = this.cam_preview_height + 'px'
      },
      err => {
        console.log(err)
      }
    )
    console.log('ionViewDidLoad RukuPage');
  }

  ionViewWillEnter () {
    if (this.input_mode == 'recognize') {
      this.cameraPreview.show()
    } else if (this.input_mode == 'input') {
      this.cameraPreview.setFlashMode('off')
      this.torch_status = false
      this.cameraPreview.hide()
    }
  }

  ionViewWillLeave () {
    this.cameraPreview.setFlashMode('off')
    this.torch_status = false
    this.cameraPreview.hide()
    // this.cameraPreview.stopCamera()
  }

  ionViewWillUnload () {
    this.cameraPreview.stopCamera()
  }

  search_beijianext (res) {
    let self = this
    let beijianext = ''
    if (res == 'manual') {
      beijianext = this.beijianext_input[res]
    } else {
      beijianext = this.ocr_result[res]
    }
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
    this.navCtrl.push(HuoweiPage, bj, {animate: true})
  }

  input_change (id, e) {
    if (e.code == 'Enter') {
      this.search_beijianext(id)
      return
    }
    this.find_result = []
  }

  photo_quality = '30'
  ocr_result = []
  photo_tap() {
    let self = this
    let loading = self.loadingCtrl.create({
      content: ''
    })
    loading.present()
    // TODO: 相机只返回可视区域的base64
    this.cameraPreview.takePicture({
      // width: this.cam_preview_width,
      // height: this.cam_preview_height,
      quality: parseInt(this.photo_quality)})
    .then(res => {
      // console.log(res[0])
      self.storage.get('ocr_token').then(ocr_token => {
        const url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=" + encodeURIComponent(ocr_token.access_token)
        let data = {
          image: res[0]
        }
        self.http.setDataSerializer('urlencoded')
        self.http.post(url, data,
          {'content-type': 'application/x-www-form-urlencoded'})
          .then(res => {
            loading.dismiss()
            console.log(res.data)
            res.data = JSON.parse(res.data)
            if (res.data.words_result_num == 0) {
              self.presentToast('图中没有文字!')
              return
            }
            self.ocr_result = res.data.words_result.map(a=>a.words)
          }, res => {
            loading.dismiss()
            self.presentToast("获取OCR组件失败")
          })

          // let binput = {manual: self.beijianext_input.manual}
          // ress.data.words_result.forEach((r, n)=>{
          //   binput['ocr_' + n] = r.words
          // })
          // self.beijianext_input = binput
      })
      // document.getElementById('my-img').setAttribute('src', 'data:image/jpeg;base64,' + res[0])
    })
  }

  torch_tap() {
    if (!this.torch_status) {
      this.cameraPreview.setFlashMode('torch')
      this.torch_status = true
    } else {
      this.cameraPreview.setFlashMode('off')
      this.torch_status = false
    }
  }

  mode_change(e) {
    if (this.input_mode == 'recognize') {
      this.cameraPreview.show()
    } else if (this.input_mode == 'input') {
      this.cameraPreview.setFlashMode('off')
      this.torch_status = false
      this.cameraPreview.hide()
    }
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

  bd_ocr_init () {
    let self = this
    this.storage.get('ocr_token').then(ocr_token => {
      ocr_token = ocr_token || { "access_token": false, "expires_in": 0, "request_date": 0 }
      const now = Math.floor(Date.now() / 1000)
      const expire = ocr_token.request_date + ocr_token.expires_in - 86400
      const AK = "OqS20osVXfS756feFx6k0bA0"
      const SK = "19jzgY2EHfmGZDMOryrMqlzoPP2WZ7lB"
      if (!ocr_token.access_token || now > expire) {
        // 'grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK
        const token_url = 'https://aip.baidubce.com/oauth/2.0/token'
        self.http.get(token_url, {grant_type: 'client_credentials', client_id: AK, client_secret: SK}, {})
        .then(res => {
          res.data = JSON.parse(res.data)
          if (res.data.access_token) {
            ocr_token.access_token = res.data.access_token
            ocr_token.expires_in = res.data.expires_in
            ocr_token.request_date = Math.floor(Date.now() / 1000)
            self.storage.set("ocr_token", ocr_token)
          }
          }, res => {
          self.presentToast("获取OCR组件失败")
        })
      }
    })
  }

}
