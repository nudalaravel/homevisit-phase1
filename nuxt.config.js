export default {
  ssr: false,
  mode: "spa",

  // Server configuration
  // ⚠️ PRODUCTION: แก้ port หรือใช้ environment variable
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
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "/fonts/kanit.css",
      },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "manifest", href: "/manifest.json" },
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
  // ⚠️ PRODUCTION: แก้ baseURL เป็น production API URL
  // เช่น baseURL: "https://api.yourdomain.com"
  axios: {
    baseURL: "/api",
    browserBaseURL: "/api",
    proxy: true, // ⚠️ PRODUCTION: เปลี่ยนเป็น false ถ้าไม่ใช้ proxy
    credentials: true,
  },

  // ⚠️ PRODUCTION: ถ้าไม่ใช้ proxy ให้ลบหรือ comment block นี้ออก
  // หรือเปลี่ยน target เป็น production API URL
  // Proxy config - bypass CORS ทุกครั้ง
  proxy: {
    "/api": {
      target: "https://ripedresearch.org", // ⚠️ PRODUCTION: แก้เป็น production API URL
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
    // base: "/folder-deploy/",
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
      ogImage: "/logo.png", //แก้พาท logo
      ogUrl: "https://ripped-v2.com", // ⚠️ PRODUCTION: แก้เป็น production URL
      twitterCard: "summary_large_image",
      twitterSite: "@ripped", // ⚠️ PRODUCTION: แก้เป็น Twitter account จริง (ถ้ามี)
      twitterCreator: "@ripped", // ⚠️ PRODUCTION: แก้เป็น Twitter account จริง (ถ้ามี)
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
      // ⚠️ PRODUCTION: เปลี่ยนเป็น true เพื่อเปิดใช้งาน service worker และ cache
      enabled: false, // ปิด cache ไว้ก่อน เพื่อการ development *อย่าพึ่งเปิด
      runtimeCaching: [
        {
          // ⚠️ PRODUCTION: แก้ urlPattern เป็น production API URL
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
};
