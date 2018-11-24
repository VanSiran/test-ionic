import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,
  LoadingController, ToastController } from 'ionic-angular';

// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';

import { TabsPage } from '../tabs/tabs';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  login_text: string = ''
  password_text: string = ''
  @ViewChild('login') login_box;
  @ViewChild('password') password_box;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage, public loadingCtrl: LoadingController,
    public toastCtrl: ToastController, public http: HTTP) {
  }

  ionViewDidLoad() {
    this.storage.get('userinfo')
      .then(
        userinfo => {
          userinfo = userinfo || { "session_id": false, "login": false, "password": false, "uid": false }
          if (userinfo.uid !== false && userinfo.login.length > 0 && userinfo.password.length > 0) {
            this.wms_login(userinfo.login, userinfo.password, false)//opt.no_main
            console.log(userinfo.login, userinfo.password)
            return
          }
          if (userinfo.login) {
            this.login_text = userinfo.login
          }
        },
        error => console.log(error)
      )
    console.log('ionViewDidLoad LoginPage');
  }

  login_tap () {
    // console.log('sdasdsda')
    this.wms_login(this.login_text, this.password_text)
  }

  wms_login (login, password, no_main=false) {
    if (!login || !password) {
      // this.presentToast('输入用户名和密码')
      if (!login) {
        this.login_box.setFocus()
        return
      }
      if (!password) {
        this.password_box.setFocus()
        return
      }
      // return
    }
    let loading = this.loadingCtrl.create({
      content: ''
    });
    loading.present()

    let data = {
      'jsonrpc': '2.0',
      'params': {
        'db': 'tjdwd',
        'login': login,
        'password': password,
      }
    }
    this.http.setDataSerializer('json')
    this.http.post('http://47.95.8.185/web/session/authenticate', data, {})
      .then(res => {
        loading.dismiss()
        res.data = JSON.parse(res.data)
        if (res.data.result.uid !== false) {
          this.storage.set('userinfo', {
            session_id: res.data.result.session_id,
            login: res.data.result.username,
            password: password,
            uid: res.data.result.uid,
          })
          if (no_main == false) {
            this.navCtrl.push(TabsPage, {}, {animate: false})
          }
        } else {
          this.presentToast('用户名或密码错误')
        }
     }).catch(err => {
       loading.dismiss()
       this.presentToast(JSON.stringify(err))
     })
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

  presentLoadingDefault() {
    let loading = this.loadingCtrl.create({
      content: ''
    });

    loading.present();
    setTimeout(() => {
      loading.dismiss();
    }, 120000);
  }

  login_text_change(event) {
    // this.login_text = event.target.value
    if (event.code == 'Enter') {
      this.password_box.setFocus()
    }
  }

  password_text_change(event) {
    // this.password_text = event.target.value
    if (event.code == 'Enter') {
      this.login_tap()
    }
  }
}
