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
    baseURL:
      process.env.NODE_ENV === "production"
        ? "https://ripedresearch.org"
        : "/api",
    browserBaseURL:
      process.env.NODE_ENV === "production"
        ? "https://ripedresearch.org"
        : "/api",
    proxy: true, // เปิดใช้ proxy เพื่อ bypass CORS
    credentials: true,
  },

  // Proxy config - bypass CORS
  proxy: {
    "/api": {
      target: "https://ripedresearch.org",
      pathRewrite: {
        "^/api": "", // ลบ /api prefix ก่อนส่งไปยัง target
      },
      changeOrigin: true, // เปลี่ยน origin header ให้ตรงกับ target
      secure: false, // อนุญาตให้ติดต่อกับ HTTPS ที่มี self-signed certificate
      cookieDomainRewrite: {
        "*": "", // ลบ domain จาก cookies
      },
      onProxyReq(proxyReq, req, res) {
        // เพิ่ม headers เพื่อให้ server ยอมรับ request
        proxyReq.setHeader("Origin", "https://ripedresearch.org");
        proxyReq.setHeader("Referer", "https://ripedresearch.org/");
      },
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
      enabled: process.env.NODE_ENV === "production", // เปิดใน production, ปิดใน development
      runtimeCaching: [
        {
          // API Cache - networkFirst (ลองเน็ตก่อน ถ้าไม่ได้ใช้ cache)
          urlPattern: "^https://ripedresearch.org/.*",
          handler: "networkFirst",
          method: "GET",
          strategyOptions: {
            cacheName: "api-cache",
            networkTimeoutSeconds: 10,
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
            },
          },
        },
        {
          // Image Cache - cacheFirst (ใช้ cache ก่อน ประหยัดเน็ต)
          urlPattern: /\.(png|jpg|jpeg|gif|webp|svg)$/,
          handler: "cacheFirst",
          strategyOptions: {
            cacheName: "image-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
            },
          },
        },
        {
          // S3 Image Cache - cacheFirst
          urlPattern: /^https:\/\/.*\.s3\..*\.amazonaws\.com\/.*/,
          handler: "cacheFirst",
          strategyOptions: {
            cacheName: "s3-image-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
            },
          },
        },
      ],
      // Offline page
      offlinePage: "/homevisit/offline/",
      // Register service worker
      autoRegister: true,
    },
  },
};
