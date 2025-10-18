export default {
  ssr: false,
  mode: "spa",

  // Server configuration
  server: {
    port: process.env.PORT || 3300,
    host: process.env.HOST || "0.0.0.0",
  },

  head: {
    title: "Riped V2 Research",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Research Dashboard Template",
      },
      { name: "theme-color", content: "#3551a4" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Riped V2 Research" },
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
    "~/plugins/auth-custom",
    "~/plugins/offline",
    "~/plugins/auth-offline",
    "~/plugins/indexeddb",
    "~/plugins/system-init",
    "~/plugins/toast",
    "~/plugins/sweetalert",
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
    proxy: true,
  },
  proxy: {
    "/api/": {
      target: "https://ripedresearch.org",
      pathRewrite: {
        "^/api/": "/api/",
      },
      changeOrigin: true,
    },
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: "/api/spa/login/login.php",
            method: "post",
            propertyName: "token",
          },
          logout: false, // Disable logout endpoint - handled client-side only
          user: false, // Disable user endpoint - we get user from login response
        },
        token: {
          property: "token",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        },
        user: {
          property: "user", // Get user from login response
          autoFetch: "/api/spa/login/verify.php", // Disable auto fetch to prevent API calls
        },
        clientId: false,
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
      title: "Riped V2 Research",
      author: "Riped Team",
      description: "Research Dashboard Template",
      theme_color: "#3551a4",
      lang: "th",
      ogSiteName: "Riped V2 Research",
      ogTitle: "Riped V2 Research",
      ogDescription: "Research Dashboard Template",
      ogImage: "/logo.png",
      ogUrl: "https://ripped-v2.com",
      twitterCard: "summary_large_image",
      twitterSite: "@ripped",
      twitterCreator: "@ripped",
    },
    manifest: {
      name: "Riped V2 Research",
      short_name: "Riped Research",
      description: "Research Dashboard Template with Offline Support",
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
