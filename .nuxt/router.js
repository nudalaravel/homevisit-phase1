import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _2b2e6090 = () => interopDefault(import('../pages/admin-document.vue' /* webpackChunkName: "pages/admin-document" */))
const _2f5b490e = () => interopDefault(import('../pages/admin-payment.vue' /* webpackChunkName: "pages/admin-payment" */))
const _255d76c0 = () => interopDefault(import('../pages/admin-payment-history.vue' /* webpackChunkName: "pages/admin-payment-history" */))
const _854d9aaa = () => interopDefault(import('../pages/admin-receipt.vue' /* webpackChunkName: "pages/admin-receipt" */))
const _5fd186de = () => interopDefault(import('../pages/admin-report.vue' /* webpackChunkName: "pages/admin-report" */))
const _3be2b8b2 = () => interopDefault(import('../pages/admin-visit-results.vue' /* webpackChunkName: "pages/admin-visit-results" */))
const _681781da = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _7177685a = () => interopDefault(import('../pages/supervisor-booking.vue' /* webpackChunkName: "pages/supervisor-booking" */))
const _7eeec80e = () => interopDefault(import('../pages/supervisor-dashboard.vue' /* webpackChunkName: "pages/supervisor-dashboard" */))
const _5afbc511 = () => interopDefault(import('../pages/supervisor-document.vue' /* webpackChunkName: "pages/supervisor-document" */))
const _692c97ac = () => interopDefault(import('../pages/supervisor-report.vue' /* webpackChunkName: "pages/supervisor-report" */))
const _301f8350 = () => interopDefault(import('../pages/supervisor-survey.vue' /* webpackChunkName: "pages/supervisor-survey" */))
const _4510288e = () => interopDefault(import('../pages/survey.vue' /* webpackChunkName: "pages/survey" */))
const _c320427a = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

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
    component: _2b2e6090,
    name: "admin-document"
  }, {
    path: "/admin-payment",
    component: _2f5b490e,
    name: "admin-payment"
  }, {
    path: "/admin-payment-history",
    component: _255d76c0,
    name: "admin-payment-history"
  }, {
    path: "/admin-receipt",
    component: _854d9aaa,
    name: "admin-receipt"
  }, {
    path: "/admin-report",
    component: _5fd186de,
    name: "admin-report"
  }, {
    path: "/admin-visit-results",
    component: _3be2b8b2,
    name: "admin-visit-results"
  }, {
    path: "/login",
    component: _681781da,
    name: "login"
  }, {
    path: "/supervisor-booking",
    component: _7177685a,
    name: "supervisor-booking"
  }, {
    path: "/supervisor-dashboard",
    component: _7eeec80e,
    name: "supervisor-dashboard"
  }, {
    path: "/supervisor-document",
    component: _5afbc511,
    name: "supervisor-document"
  }, {
    path: "/supervisor-report",
    component: _692c97ac,
    name: "supervisor-report"
  }, {
    path: "/supervisor-survey",
    component: _301f8350,
    name: "supervisor-survey"
  }, {
    path: "/survey",
    component: _4510288e,
    name: "survey"
  }, {
    path: "/",
    component: _c320427a,
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
