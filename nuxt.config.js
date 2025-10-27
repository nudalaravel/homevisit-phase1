export default {
  ssr: false,
  mode: "spa",

  server: {
    port: 3300,
    host: "0.0.0.0",
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
      { rel: "icon", type: "image/x-icon", href: "/homevisit/favicon.ico" },
      {
        rel: "stylesheet",
        href: "/homevisit/fonts/kanit.css",
      },
      { rel: "apple-touch-icon", href: "/homevisit/logo.png" },
      { rel: "manifest", href: "/homevisit/manifest.json" },
    ],
  },
  loading: { color: "#3551a4" },
  css: [
    "~/assets/css/main.css",
    "@fortawesome/fontawesome-free/css/all.min.css",
  ],
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
    baseURL: "https://ripedresearch.org",
    browserBaseURL: "https://ripedresearch.org",
    proxy: false, // ⚠️ PRODUCTION: เปลี่ยนเป็น false ถ้าไม่ใช้ proxy
    credentials: true,
  },

  // ⚠️ PRODUCTION: ถ้าไม่ใช้ proxy ให้ลบหรือ comment block นี้ออก
  // หรือเปลี่ยน target เป็น production API URL
  // Proxy config - bypass CORS ทุกครั้ง
  proxy: {
    "/api": {
      target: "https://ripedresearch.org",
      pathRewrite: {
        "^/api": "",
      },
      changeOrigin: true,
      secure: false,
      cookieDomainRewrite: "localhost", // ⚠️ PRODUCTION: แก้เป็น production domain
      headers: {
        Connection: "keep-alive",
      },
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
    // ⚠️ PRODUCTION: ถ้า deploy ใน subfolder ให้ uncomment และแก้ path
    base: "/homevisit/",
    middleware: [],
  },
  // serverMiddleware: ["~/api"], // Disabled - API runs separately
  pwa: {
    meta: {
      title: "Riped V2 Research",
      author: "Riped Team",
      description: "",
      theme_color: "#3551a4",
      lang: "th",
    },
    manifest: {
      name: "Riped V2 Research",
      short_name: "Riped Research",
      description: "",
      theme_color: "#3551a4",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      scope: "/homevisit/",
      start_url: "/homevisit/",
      lang: "th",
      icons: [
        {
          src: "/homevisit/logo.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/homevisit/logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      // ⚠️ PRODUCTION: เปลี่ยนเป็น true เพื่อเปิดใช้งาน service worker และ cache
      enabled: false, // ปิด cache ไว้ก่อน เพื่อการ development *อย่าพึ่งเปิด
      runtimeCaching: [
        {
          // ⚠️ PRODUCTION: แก้ urlPattern เป็น production API URL
          urlPattern: "^https://ripedresearch.org/api/.*",
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
};
