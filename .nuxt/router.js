import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _8131b2b2 = () => interopDefault(import('..\\pages\\admin-document.vue' /* webpackChunkName: "pages/admin-document" */))
const _41c5eaaa = () => interopDefault(import('..\\pages\\admin-payment.vue' /* webpackChunkName: "pages/admin-payment" */))
const _1229761e = () => interopDefault(import('..\\pages\\admin-payment-history.vue' /* webpackChunkName: "pages/admin-payment-history" */))
const _16ccc1dc = () => interopDefault(import('..\\pages\\admin-receipt.vue' /* webpackChunkName: "pages/admin-receipt" */))
const _1d4c8340 = () => interopDefault(import('..\\pages\\admin-report.vue' /* webpackChunkName: "pages/admin-report" */))
const _57276bd0 = () => interopDefault(import('..\\pages\\admin-visit-results.vue' /* webpackChunkName: "pages/admin-visit-results" */))
const _47c1d20b = () => interopDefault(import('..\\pages\\login.vue' /* webpackChunkName: "pages/login" */))
const _9360d97c = () => interopDefault(import('..\\pages\\supervisor-booking.vue' /* webpackChunkName: "pages/supervisor-booking" */))
const _4f742086 = () => interopDefault(import('..\\pages\\supervisor-dashboard.vue' /* webpackChunkName: "pages/supervisor-dashboard" */))
const _4d596b82 = () => interopDefault(import('..\\pages\\supervisor-document.vue' /* webpackChunkName: "pages/supervisor-document" */))
const _153042db = () => interopDefault(import('..\\pages\\supervisor-report.vue' /* webpackChunkName: "pages/supervisor-report" */))
const _79e61201 = () => interopDefault(import('..\\pages\\supervisor-survey.vue' /* webpackChunkName: "pages/supervisor-survey" */))
const _19d0bcb0 = () => interopDefault(import('..\\pages\\survey.vue' /* webpackChunkName: "pages/survey" */))
const _7e1a2ef4 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

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
    component: _8131b2b2,
    name: "admin-document"
  }, {
    path: "/admin-payment",
    component: _41c5eaaa,
    name: "admin-payment"
  }, {
    path: "/admin-payment-history",
    component: _1229761e,
    name: "admin-payment-history"
  }, {
    path: "/admin-receipt",
    component: _16ccc1dc,
    name: "admin-receipt"
  }, {
    path: "/admin-report",
    component: _1d4c8340,
    name: "admin-report"
  }, {
    path: "/admin-visit-results",
    component: _57276bd0,
    name: "admin-visit-results"
  }, {
    path: "/login",
    component: _47c1d20b,
    name: "login"
  }, {
    path: "/supervisor-booking",
    component: _9360d97c,
    name: "supervisor-booking"
  }, {
    path: "/supervisor-dashboard",
    component: _4f742086,
    name: "supervisor-dashboard"
  }, {
    path: "/supervisor-document",
    component: _4d596b82,
    name: "supervisor-document"
  }, {
    path: "/supervisor-report",
    component: _153042db,
    name: "supervisor-report"
  }, {
    path: "/supervisor-survey",
    component: _79e61201,
    name: "supervisor-survey"
  }, {
    path: "/survey",
    component: _19d0bcb0,
    name: "survey"
  }, {
    path: "/",
    component: _7e1a2ef4,
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
