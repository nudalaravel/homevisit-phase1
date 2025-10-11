export default {
  ssr: false,
  mode: "spa",

  // Server configuration
  server: {
    port: process.env.PORT || 3300,
    host: process.env.HOST || "0.0.0.0",
  },

  head: {
    title: "Riped V2 Admin",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Admin Dashboard Template",
      },
      { name: "theme-color", content: "#3551a4" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Riped V2 Admin" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "/fonts/kanit.css",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
      },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  },
  loading: { color: "#3551a4" },
  css: ["~/assets/css/main.css"],
  plugins: [
    "~/plugins/bootstrap-vue",
    "~/plugins/axios",
    "~/plugins/offline",
    "~/plugins/auth-offline",
    "~/plugins/fake-indexeddb",
    "~/plugins/indexeddb",
    "~/plugins/toast",
  ],
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  modules: [
    "@nuxtjs/axios",
    "@nuxtjs/auth",
    "@nuxtjs/bootstrap-vue",
    "@nuxtjs/pwa",
  ],
  axios: {
    baseURL: process.env.API_BASE_URL || "http://localhost:3001",
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: "/auth/login", method: "post", propertyName: "token" },
          logout: false, // Disable logout endpoint - handled client-side only
          user: { url: "/auth/user", method: "get", propertyName: "user" },
        },
        token: {
          property: "token",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        },
        user: {
          property: "user",
          autoFetch: false, // Disable auto fetch to prevent API calls
        },
      },
    },
    redirect: {
      login: "/login",
      logout: "/login",
      callback: "/login",
      home: "/",
    },
  },
  router: {
    middleware: [],
  },
  // serverMiddleware: ["~/api"], // Disabled - API runs separately
  pwa: {
    meta: {
      title: "Riped V2 Admin",
      author: "Riped Team",
      description: "Admin Dashboard Template",
      theme_color: "#3551a4",
      lang: "th",
      ogSiteName: "Riped V2 Admin",
      ogTitle: "Riped V2 Admin",
      ogDescription: "Admin Dashboard Template",
      ogImage: "/logo.png",
      ogUrl: "https://ripped-v2.com",
      twitterCard: "summary_large_image",
      twitterSite: "@ripped",
      twitterCreator: "@ripped",
    },
    manifest: {
      name: "Riped V2 Admin",
      short_name: "Riped Admin",
      description: "Admin Dashboard Template with Offline Support",
      theme_color: "#3551a4",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      lang: "th",
      icons: [
        {
          src: "/logo.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      enabled:
        process.env.NODE_ENV === "production" &&
        process.env.ENABLE_CACHE === "true",
      runtimeCaching: [
        {
          urlPattern: "^https://cdnjs.cloudflare.com/.*",
          handler: "cacheFirst",
          method: "GET",
          strategyOptions: {
            cacheName: "cdn-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: "^http://localhost:3001/.*",
          handler: "networkFirst",
          method: "GET",
          strategyOptions: {
            cacheName: "api-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
  env: {
    ENABLE_CACHE: process.env.ENABLE_CACHE || "false",
  },
};
