import Vue from 'vue'
import Vuex from 'vuex'
import Meta from 'vue-meta'
import ClientOnly from 'vue-client-only'
import NoSsr from 'vue-no-ssr'
import { createRouter } from './router.js'
import NuxtChild from './components/nuxt-child.js'
import NuxtError from './components/nuxt-error.vue'
import Nuxt from './components/nuxt.js'
import App from './App.js'
import { setContext, getLocation, getRouteData, normalizeError } from './utils'
import { createStore } from './store.js'

/* Plugins */

import nuxt_plugin_plugin_5842b436 from 'nuxt_plugin_plugin_5842b436' // Source: ./components/plugin.js (mode: 'all')
import nuxt_plugin_workbox_67a902d7 from 'nuxt_plugin_workbox_67a902d7' // Source: ./workbox.js (mode: 'client')
import nuxt_plugin_metaplugin_7e5982ea from 'nuxt_plugin_metaplugin_7e5982ea' // Source: ./pwa/meta.plugin.js (mode: 'all')
import nuxt_plugin_bootstrapvue_837e18ac from 'nuxt_plugin_bootstrapvue_837e18ac' // Source: ./bootstrap-vue.js (mode: 'all')
import nuxt_plugin_axios_26f27f0a from 'nuxt_plugin_axios_26f27f0a' // Source: ./axios.js (mode: 'all')
import nuxt_plugin_bootstrapvue_928a4c1e from 'nuxt_plugin_bootstrapvue_928a4c1e' // Source: ../plugins/bootstrap-vue (mode: 'all')
import nuxt_plugin_axios_3566aa80 from 'nuxt_plugin_axios_3566aa80' // Source: ../plugins/axios (mode: 'all')
import nuxt_plugin_authcustom_2fe02a00 from 'nuxt_plugin_authcustom_2fe02a00' // Source: ../plugins/auth-custom (mode: 'all')
import nuxt_plugin_offline_eafd7ca6 from 'nuxt_plugin_offline_eafd7ca6' // Source: ../plugins/offline (mode: 'all')
import nuxt_plugin_authoffline_2c9c4134 from 'nuxt_plugin_authoffline_2c9c4134' // Source: ../plugins/auth-offline (mode: 'all')
import nuxt_plugin_indexeddb_3fb74679 from 'nuxt_plugin_indexeddb_3fb74679' // Source: ../plugins/indexeddb (mode: 'all')
import nuxt_plugin_systeminit_62d658b8 from 'nuxt_plugin_systeminit_62d658b8' // Source: ../plugins/system-init (mode: 'all')
import nuxt_plugin_toast_3357971e from 'nuxt_plugin_toast_3357971e' // Source: ../plugins/toast (mode: 'all')
import nuxt_plugin_sweetalert_4d5e1f3c from 'nuxt_plugin_sweetalert_4d5e1f3c' // Source: ../plugins/sweetalert (mode: 'all')
import nuxt_plugin_select2_27978b77 from 'nuxt_plugin_select2_27978b77' // Source: ../plugins/select2.js (mode: 'client')
import nuxt_plugin_plugin_79477512 from 'nuxt_plugin_plugin_79477512' // Source: ./auth/plugin.js (mode: 'all')

// Component: <ClientOnly>
Vue.component(ClientOnly.name, ClientOnly)

// TODO: Remove in Nuxt 3: <NoSsr>
Vue.component(NoSsr.name, {
  ...NoSsr,
  render (h, ctx) {
    if (process.client && !NoSsr._warned) {
      NoSsr._warned = true

      console.warn('<no-ssr> has been deprecated and will be removed in Nuxt 3, please use <client-only> instead')
    }
    return NoSsr.render(h, ctx)
  }
})

// Component: <NuxtChild>
Vue.component(NuxtChild.name, NuxtChild)
Vue.component('NChild', NuxtChild)

// Component NuxtLink is imported in server.js or client.js

// Component: <Nuxt>
Vue.component(Nuxt.name, Nuxt)

Object.defineProperty(Vue.prototype, '$nuxt', {
  get() {
    const globalNuxt = this.$root ? this.$root.$options.$nuxt : null
    if (process.client && !globalNuxt && typeof window !== 'undefined') {
      return window.$nuxt
    }
    return globalNuxt
  },
  configurable: true
})

Vue.use(Meta, {"keyName":"head","attribute":"data-n-head","ssrAttribute":"data-n-head-ssr","tagIDKeyName":"hid"})

const defaultTransition = {"name":"page","mode":"out-in","appear":true,"appearClass":"appear","appearActiveClass":"appear-active","appearToClass":"appear-to"}

const originalRegisterModule = Vuex.Store.prototype.registerModule

function registerModule (path, rawModule, options = {}) {
  const preserveState = process.client && (
    Array.isArray(path)
      ? !!path.reduce((namespacedState, path) => namespacedState && namespacedState[path], this.state)
      : path in this.state
  )
  return originalRegisterModule.call(this, path, rawModule, { preserveState, ...options })
}

async function createApp(ssrContext, config = {}) {
  const store = createStore(ssrContext)
  const router = await createRouter(ssrContext, config, { store })

  // Add this.$router into store actions/mutations
  store.$router = router

  // Create Root instance

  // here we inject the router and store to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = {
    head: {"title":"Riped V2 Research","meta":[{"charset":"utf-8"},{"name":"viewport","content":"width=device-width, initial-scale=1"},{"hid":"description","name":"description","content":"Research Dashboard Template"},{"name":"theme-color","content":"#3551a4"},{"name":"apple-mobile-web-app-capable","content":"yes"},{"name":"apple-mobile-web-app-status-bar-style","content":"default"},{"name":"apple-mobile-web-app-title","content":"Riped V2 Research"},{"hid":"charset","charset":"utf-8"},{"hid":"mobile-web-app-capable","name":"mobile-web-app-capable","content":"yes"},{"hid":"author","name":"author","content":"Riped Team"},{"hid":"og:type","name":"og:type","property":"og:type","content":"website"},{"hid":"og:title","name":"og:title","property":"og:title","content":"Riped V2 Research"},{"hid":"og:site_name","name":"og:site_name","property":"og:site_name","content":"Riped V2 Research"},{"hid":"og:description","name":"og:description","property":"og:description","content":"Research Dashboard Template"}],"link":[{"rel":"icon","type":"image\u002Fx-icon","href":"\u002Fhomevisit\u002Ffavicon.ico"},{"rel":"stylesheet","href":"\u002Fhomevisit\u002Ffonts\u002Fkanit.css"},{"rel":"apple-touch-icon","href":"\u002Fhomevisit\u002Flogo.png"},{"rel":"manifest","href":"\u002Fhomevisit\u002Fmanifest.json"},{"hid":"shortcut-icon","rel":"shortcut icon","href":"\u002Fhomevisit\u002Flogo.png"},{"hid":"apple-touch-icon","rel":"apple-touch-icon","href":"\u002Fhomevisit\u002Flogo.png","sizes":"512x512"},{"rel":"manifest","href":"\u002Fhomevisit\u002F_nuxt\u002Fmanifest.ca1325ce.json","hid":"manifest"}],"style":[],"script":[],"htmlAttrs":{"lang":"th"}},

    store,
    router,
    nuxt: {
      defaultTransition,
      transitions: [defaultTransition],
      setTransitions (transitions) {
        if (!Array.isArray(transitions)) {
          transitions = [transitions]
        }
        transitions = transitions.map((transition) => {
          if (!transition) {
            transition = defaultTransition
          } else if (typeof transition === 'string') {
            transition = Object.assign({}, defaultTransition, { name: transition })
          } else {
            transition = Object.assign({}, defaultTransition, transition)
          }
          return transition
        })
        this.$options.nuxt.transitions = transitions
        return transitions
      },

      err: null,
      errPageReady: false,
      dateErr: null,
      error (err) {
        err = err || null
        app.context._errored = Boolean(err)
        err = err ? normalizeError(err) : null
        let nuxt = app.nuxt // to work with @vue/composition-api, see https://github.com/nuxt/nuxt.js/issues/6517#issuecomment-573280207
        if (this) {
          nuxt = this.nuxt || this.$options.nuxt
        }
        nuxt.dateErr = Date.now()
        nuxt.err = err
        nuxt.errPageReady = false
        // Used in src/server.js
        if (ssrContext) {
          ssrContext.nuxt.error = err
        }
        return err
      }
    },
    ...App
  }

  // Make app available into store via this.app
  store.app = app

  const next = ssrContext ? ssrContext.next : location => app.router.push(location)
  // Resolve route
  let route
  if (ssrContext) {
    route = router.resolve(ssrContext.url).route
  } else {
    const path = getLocation(router.options.base, router.options.mode)
    route = router.resolve(path).route
  }

  // Set context to app.context
  await setContext(app, {
    store,
    route,
    next,
    error: app.nuxt.error.bind(app),
    payload: ssrContext ? ssrContext.payload : undefined,
    req: ssrContext ? ssrContext.req : undefined,
    res: ssrContext ? ssrContext.res : undefined,
    beforeRenderFns: ssrContext ? ssrContext.beforeRenderFns : undefined,
    beforeSerializeFns: ssrContext ? ssrContext.beforeSerializeFns : undefined,
    ssrContext
  })

  function inject(key, value) {
    if (!key) {
      throw new Error('inject(key, value) has no key provided')
    }
    if (value === undefined) {
      throw new Error(`inject('${key}', value) has no value provided`)
    }

    key = '$' + key
    // Add into app
    app[key] = value
    // Add into context
    if (!app.context[key]) {
      app.context[key] = value
    }

    // Add into store
    store[key] = app[key]

    // Check if plugin not already installed
    const installKey = '__nuxt_' + key + '_installed__'
    if (Vue[installKey]) {
      return
    }
    Vue[installKey] = true
    // Call Vue.use() to install the plugin into vm
    Vue.use(() => {
      if (!Object.prototype.hasOwnProperty.call(Vue.prototype, key)) {
        Object.defineProperty(Vue.prototype, key, {
          get () {
            return this.$root.$options[key]
          }
        })
      }
    })
  }

  // Inject runtime config as $config
  inject('config', config)

  if (process.client) {
    // Replace store state before plugins execution
    if (window.__NUXT__ && window.__NUXT__.state) {
      store.replaceState(window.__NUXT__.state)
    }
  }

  // Add enablePreview(previewData = {}) in context for plugins
  if (process.static && process.client) {
    app.context.enablePreview = function (previewData = {}) {
      app.previewData = Object.assign({}, previewData)
      inject('preview', previewData)
    }
  }
  // Plugin execution

  if (typeof nuxt_plugin_plugin_5842b436 === 'function') {
    await nuxt_plugin_plugin_5842b436(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_workbox_67a902d7 === 'function') {
    await nuxt_plugin_workbox_67a902d7(app.context, inject)
  }

  if (typeof nuxt_plugin_metaplugin_7e5982ea === 'function') {
    await nuxt_plugin_metaplugin_7e5982ea(app.context, inject)
  }

  if (typeof nuxt_plugin_bootstrapvue_837e18ac === 'function') {
    await nuxt_plugin_bootstrapvue_837e18ac(app.context, inject)
  }

  if (typeof nuxt_plugin_axios_26f27f0a === 'function') {
    await nuxt_plugin_axios_26f27f0a(app.context, inject)
  }

  if (typeof nuxt_plugin_bootstrapvue_928a4c1e === 'function') {
    await nuxt_plugin_bootstrapvue_928a4c1e(app.context, inject)
  }

  if (typeof nuxt_plugin_axios_3566aa80 === 'function') {
    await nuxt_plugin_axios_3566aa80(app.context, inject)
  }

  if (typeof nuxt_plugin_authcustom_2fe02a00 === 'function') {
    await nuxt_plugin_authcustom_2fe02a00(app.context, inject)
  }

  if (typeof nuxt_plugin_offline_eafd7ca6 === 'function') {
    await nuxt_plugin_offline_eafd7ca6(app.context, inject)
  }

  if (typeof nuxt_plugin_authoffline_2c9c4134 === 'function') {
    await nuxt_plugin_authoffline_2c9c4134(app.context, inject)
  }

  if (typeof nuxt_plugin_indexeddb_3fb74679 === 'function') {
    await nuxt_plugin_indexeddb_3fb74679(app.context, inject)
  }

  if (typeof nuxt_plugin_systeminit_62d658b8 === 'function') {
    await nuxt_plugin_systeminit_62d658b8(app.context, inject)
  }

  if (typeof nuxt_plugin_toast_3357971e === 'function') {
    await nuxt_plugin_toast_3357971e(app.context, inject)
  }

  if (typeof nuxt_plugin_sweetalert_4d5e1f3c === 'function') {
    await nuxt_plugin_sweetalert_4d5e1f3c(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_select2_27978b77 === 'function') {
    await nuxt_plugin_select2_27978b77(app.context, inject)
  }

  if (typeof nuxt_plugin_plugin_79477512 === 'function') {
    await nuxt_plugin_plugin_79477512(app.context, inject)
  }

  // Lock enablePreview in context
  if (process.static && process.client) {
    app.context.enablePreview = function () {
      console.warn('You cannot call enablePreview() outside a plugin.')
    }
  }

  // Wait for async component to be resolved first
  await new Promise((resolve, reject) => {
    // Ignore 404s rather than blindly replacing URL in browser
    if (process.client) {
      const { route } = router.resolve(app.context.route.fullPath)
      if (!route.matched.length) {
        return resolve()
      }
    }
    router.replace(app.context.route.fullPath, resolve, (err) => {
      // https://github.com/vuejs/vue-router/blob/v3.4.3/src/util/errors.js
      if (!err._isRouter) return reject(err)
      if (err.type !== 2 /* NavigationFailureType.redirected */) return resolve()

      // navigated to a different route in router guard
      const unregister = router.afterEach(async (to, from) => {
        if (process.server && ssrContext && ssrContext.url) {
          ssrContext.url = to.fullPath
        }
        app.context.route = await getRouteData(to)
        app.context.params = to.params || {}
        app.context.query = to.query || {}
        unregister()
        resolve()
      })
    })
  })

  return {
    store,
    app,
    router
  }
}

export { createApp, NuxtError }
