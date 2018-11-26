// import { HTTP } from '@ionic-native/http';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { LoginPage } from '../pages/login/login';

const HOST = "http://47.95.8.185/"

function default_session_expire(navCtrl: NavController) {
  // TODO: 过期重登陆逻辑修正
  // wx.redirectTo({
  //   url: '/pages/login/login?no_main=1',###!!!
  // })
  navCtrl.push(LoginPage, {}, {animate:false})
}

function default_server_error(res, toastCtrl: ToastController) {
  console.log("API response error: ", res)
  let toast = toastCtrl.create({
    message: res.data.error.message + " (" + res.data.error.code + ")",
    duration: 1500,
    position: 'top',
    // cssClass: ''
  });
  toast.present();
}

function rpc(controllers,
              model: string,
              method: string,
              args,
              kwargs,
              callbacks) {
  controllers.storage.get('userinfo')
    .then(
      userinfo => {
        userinfo = userinfo || { "session_id": false, "login": false, "password": false, "uid": false }
        if (!userinfo.session_id) {
          if (callbacks.session_expire) {
            callbacks.session_expire()
          } else {
            default_session_expire(controllers.navCtrl)
          }
        } else {
          let loading = controllers.loadingCtrl.create({
            content: ''
          });
          loading.present();
          let data = {
            'jsonrpc': '2.0',
            'params': {
              'model': model,
              'method': method,
              'args': args,
              'kwargs': kwargs
            }
          }
          console.log('data send: ', JSON.stringify(data))
          controllers.http.post(HOST + 'web/dataset/call_kw', data, {
            'content-type': 'application/json',
            'cookie': "session_id=" + userinfo.session_id
          })
          .then(res => {
            loading.dismiss()
            res.data = JSON.parse(res.data)
            if (res.data.hasOwnProperty("error")) {
              if (res.data.error.code == 100) {
                // console.log(res.data)
                if (callbacks.session_expire) {
                  callbacks.session_expire()
                } else {
                  default_session_expire(controllers.navCtrl)
                }
              } else {
                if (callbacks.server_error) {
                  callbacks.server_error(res)
                } else {
                  default_server_error(res, controllers.toastCtrl)
                }
              }
            } else {
              if (!callbacks.success) {
                return
              }
              callbacks.success(res)
            }
          })
        }
      },
      error => console.log(error)
    )

}

export { rpc, default_session_expire, default_server_error }
