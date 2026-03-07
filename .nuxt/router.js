import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

<<<<<<< HEAD
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
const _e3e37d62 = () => interopDefault(import('..\\pages\\supervisor-survey-backup.vue' /* webpackChunkName: "pages/supervisor-survey-backup" */))
const _adc26d0e = () => interopDefault(import('..\\pages\\survey.vue' /* webpackChunkName: "pages/survey" */))
const _10d36dfa = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))
=======
const _2b2e6090 = () => interopDefault(import('../pages/admin-document.vue' /* webpackChunkName: "pages/admin-document" */))
const _2f5b490e = () => interopDefault(import('../pages/admin-payment.vue' /* webpackChunkName: "pages/admin-payment" */))
const _255d76c0 = () => interopDefault(import('../pages/admin-payment-history.vue' /* webpackChunkName: "pages/admin-payment-history" */))
const _854d9aaa = () => interopDefault(import('../pages/admin-receipt.vue' /* webpackChunkName: "pages/admin-receipt" */))
const _3be2b8b2 = () => interopDefault(import('../pages/admin-visit-results.vue' /* webpackChunkName: "pages/admin-visit-results" */))
const _681781da = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _7177685a = () => interopDefault(import('../pages/supervisor-booking.vue' /* webpackChunkName: "pages/supervisor-booking" */))
const _7eeec80e = () => interopDefault(import('../pages/supervisor-dashboard.vue' /* webpackChunkName: "pages/supervisor-dashboard" */))
const _5afbc511 = () => interopDefault(import('../pages/supervisor-document.vue' /* webpackChunkName: "pages/supervisor-document" */))
const _692c97ac = () => interopDefault(import('../pages/supervisor-report.vue' /* webpackChunkName: "pages/supervisor-report" */))
const _301f8350 = () => interopDefault(import('../pages/supervisor-survey.vue' /* webpackChunkName: "pages/supervisor-survey" */))
const _4510288e = () => interopDefault(import('../pages/survey.vue' /* webpackChunkName: "pages/survey" */))
const _c320427a = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))
>>>>>>> ea9ff961b8ede665b155913fb4d85c2a88797194

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
<<<<<<< HEAD
    path: "/supervisor-survey-backup",
    component: _e3e37d62,
    name: "supervisor-survey-backup"
  }, {
=======
>>>>>>> ea9ff961b8ede665b155913fb4d85c2a88797194
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
