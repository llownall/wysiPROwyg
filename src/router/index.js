import Vue from 'vue'
import VueRouter from 'vue-router'
// import wysiwygMathJax from "@/components/mathjax/wysiwygMathJax";
import wysiwygKaTeX from "@/components/katex/wysiwygKaTeX";

Vue.use(VueRouter)

const routes = [
    // {
    //     path: '/jax',
    //     name: 'wysiwygMathJax',
    //     component: wysiwygMathJax
    // },
    {
        path: '/katex',
        name: 'wysiwygKaTeX',
        component: wysiwygKaTeX,
        props: { enableImageUpload: true },
    },
]

const router = new VueRouter({
    routes
})

export default router
