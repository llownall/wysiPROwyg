import Vue from 'vue'
import VueRouter from 'vue-router'
import wysiwygMathJax from "@/components/wysiwygMathJax";

Vue.use(VueRouter)

const routes = [
  {
    path: '/jax',
    name: 'wysiwygMathJax',
    component: wysiwygMathJax
  },
]

const router = new VueRouter({
  routes
})

export default router
