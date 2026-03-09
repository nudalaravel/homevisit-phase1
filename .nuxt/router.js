import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _11942510 = () => interopDefault(import('..\\pages\\admin-document.vue' /* webpackChunkName: "pages/admin-document" */))
const _228a85b9 = () => interopDefault(import('..\\pages\\admin-payment.vue' /* webpackChunkName: "pages/admin-payment" */))
const _1a313e00 = () => interopDefault(import('..\\pages\\admin-payment-history.vue' /* webpackChunkName: "pages/admin-payment-history" */))
const _10dd462a = () => interopDefault(import('..\\pages\\admin-receipt.vue' /* webpackChunkName: "pages/admin-receipt" */))
const _dce3c432 = () => interopDefault(import('..\\pages\\admin-visit-results.vue' /* webpackChunkName: "pages/admin-visit-results" */))
const _7d8427cc = () => interopDefault(import('..\\pages\\login.vue' /* webpackChunkName: "pages/login" */))
const _48cc8993 = () => interopDefault(import('..\\pages\\supervisor-booking.vue' /* webpackChunkName: "pages/supervisor-booking" */))
const _8142d464 = () => interopDefault(import('..\\pages\\supervisor-dashboard.vue' /* webpackChunkName: "pages/supervisor-dashboard" */))
const _0a7b3f51 = () => interopDefault(import('..\\pages\\supervisor-document.vue' /* webpackChunkName: "pages/supervisor-document" */))
const _7d02be6a = () => interopDefault(import('..\\pages\\supervisor-report.vue' /* webpackChunkName: "pages/supervisor-report" */))
const _3c8ee4e0 = () => interopDefault(import('..\\pages\\supervisor-survey.vue' /* webpackChunkName: "pages/supervisor-survey" */))
const _adc26d0e = () => interopDefault(import('..\\pages\\survey.vue' /* webpackChunkName: "pages/survey" */))
const _10d36dfa = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'hash',
  base: '/homevisit/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/admin-document",
    component: _11942510,
    name: "admin-document"
  }, {
    path: "/admin-payment",
    component: _228a85b9,
    name: "admin-payment"
  }, {
    path: "/admin-payment-history",
    component: _1a313e00,
    name: "admin-payment-history"
  }, {
    path: "/admin-receipt",
    component: _10dd462a,
    name: "admin-receipt"
  }, {
    path: "/admin-visit-results",
    component: _dce3c432,
    name: "admin-visit-results"
  }, {
    path: "/login",
    component: _7d8427cc,
    name: "login"
  }, {
    path: "/supervisor-booking",
    component: _48cc8993,
    name: "supervisor-booking"
  }, {
    path: "/supervisor-dashboard",
    component: _8142d464,
    name: "supervisor-dashboard"
  }, {
    path: "/supervisor-document",
    component: _0a7b3f51,
    name: "supervisor-document"
  }, {
    path: "/supervisor-report",
    component: _7d02be6a,
    name: "supervisor-report"
  }, {
    path: "/supervisor-survey",
    component: _3c8ee4e0,
    name: "supervisor-survey"
  }, {
    path: "/survey",
    component: _adc26d0e,
    name: "survey"
  }, {
    path: "/",
    component: _10d36dfa,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
