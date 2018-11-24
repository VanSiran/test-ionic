import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
// import { Camera, CameraOptions } from '@ionic-native/camera'
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions,
  CameraPreviewDimensions } from '@ionic-native/camera-preview';

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

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private cameraPreview: CameraPreview) {
  }

  ionViewDidLoad() {
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      tapPhoto: true,
      previewDrag: true,
      toBack: true,
      alpha: 1
    };
    this.cameraPreview.startCamera(cameraPreviewOpts).then(
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

}
