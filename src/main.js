import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueRouter from 'vue-router'
import routes from './router'
import axios from "axios";
import VueAxios from 'vue-axios'
import App from './App.vue'
import VueCookies from 'vue-cookies'
import 'bootstrap/dist/css/bootstrap.min.css';

//axios.defaults.baseURL='/api'


Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(VueAxios, axios);
Vue.use(VueCookies)
Vue.config.productionTip = false


// 添加请求拦截器，在每次请求前附加JWT令牌
axios.interceptors.request.use(config => {
  const token = Vue.$cookies.get('token');  // 从 cookies 中获取 JWT 令牌

  // 判断是否是登录请求，只有非登录请求才附加 Authorization 头
  if (token && config.url !== '/api/login') {
    config.headers['Authorization'] = `Bearer ${token}`;  // 将 token 放到请求头的 Authorization 中
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const router = new VueRouter({
  routes
})


new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')
