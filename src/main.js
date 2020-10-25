import Vue from 'vue'
import App from './App.vue'
import router from './router'

const MathJax = window.MathJax;

Vue.prototype.$mathjax = MathJax;
// Object.defineProperty(Vue.prototype, '$mathjax', {value: MathJax});

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
