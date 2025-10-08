import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _3be5c9f6 = () => interopDefault(import('../pages/dashboard.vue' /* webpackChunkName: "pages/dashboard" */))
const _681781da = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _2143bdd8 = () => interopDefault(import('../pages/offline.vue' /* webpackChunkName: "pages/offline" */))
const _33c4e9c4 = () => interopDefault(import('../pages/orders.vue' /* webpackChunkName: "pages/orders" */))
const _ada129fa = () => interopDefault(import('../pages/products.vue' /* webpackChunkName: "pages/products" */))
const _e8f6437c = () => interopDefault(import('../pages/settings.vue' /* webpackChunkName: "pages/settings" */))
const _384c8e0e = () => interopDefault(import('../pages/users.vue' /* webpackChunkName: "pages/users" */))
const _c320427a = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/dashboard",
    component: _3be5c9f6,
    name: "dashboard"
  }, {
    path: "/login",
    component: _681781da,
    name: "login"
  }, {
    path: "/offline",
    component: _2143bdd8,
    name: "offline"
  }, {
    path: "/orders",
    component: _33c4e9c4,
    name: "orders"
  }, {
    path: "/products",
    component: _ada129fa,
    name: "products"
  }, {
    path: "/settings",
    component: _e8f6437c,
    name: "settings"
  }, {
    path: "/users",
    component: _384c8e0e,
    name: "users"
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
