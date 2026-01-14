export default {
  ssr: false,
  mode: "spa",

  server: {
    port: process.env.PORT || 3300,
    host: process.env.HOST || "0.0.0.0",
  },

  head: {
    title: process.env.APP_TITLE || "Riped V2 Research",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.APP_DESCRIPTION || "Research Dashboard Template",
      },
      { name: "theme-color", content: process.env.PWA_THEME_COLOR || "#3551a4" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: process.env.APP_NAME || "Riped V2 Research" },
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: process.env.PWA_FAVICON || "/homevisit/favicon.ico",
      },
      {
        rel: "stylesheet",
        href: "/homevisit/fonts/kanit.css",
      },
      { rel: "apple-touch-icon", href: process.env.PWA_ICON || "/homevisit/logo.png" },
      { rel: "manifest", href: process.env.PWA_MANIFEST || "/homevisit/manifest.json" },
    ],
  },
  loading: { color: process.env.PWA_THEME_COLOR || "#3551a4" },
  css: ["~/assets/css/main.css", "@fortawesome/fontawesome-free/css/all.min.css"],
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
    { src: "~/plugins/select2.js", mode: "client" },
  ],
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  modules: ["@nuxtjs/axios", "@nuxtjs/auth", "@nuxtjs/bootstrap-vue", "@nuxtjs/pwa"],

  axios: {
    baseURL:
      process.env.NODE_ENV === "production"
        ? process.env.API_BASE_URL || "https://ripedresearch.org"
        : "/api",
    browserBaseURL:
      process.env.NODE_ENV === "production"
        ? process.env.BROWSER_BASE_URL || "https://ripedresearch.org"
        : "/api",
    proxy: true, // เปิดใช้ proxy เพื่อ bypass CORS
    credentials: true,
  },

  // Proxy config - bypass CORS
  proxy: {
    "/api": {
      target: process.env.PROXY_TARGET || "https://ripedresearch.org",
      pathRewrite: {
        "^/api": "", // ลบ /api prefix ก่อนส่งไปยัง target
      },
      changeOrigin: process.env.PROXY_CHANGE_ORIGIN === "true" || true, // เปลี่ยน origin header ให้ตรงกับ target
      secure: process.env.PROXY_SECURE === "true" || false, // อนุญาตให้ติดต่อกับ HTTPS ที่มี self-signed certificate
      cookieDomainRewrite: {
        "*": "", // ลบ domain จาก cookies
      },
      onProxyReq(proxyReq, req, res) {
        // เพิ่ม headers เพื่อให้ server ยอมรับ request
        const proxyTarget = process.env.PROXY_TARGET || "https://ripedresearch.org";
        proxyReq.setHeader("Origin", proxyTarget);
        proxyReq.setHeader("Referer", proxyTarget + "/");
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
            url: process.env.LOGIN_ENDPOINT || "/api/spa/login/login.php",
            method: "post",
            propertyName: "token",
          },
          logout: false, // Disable logout endpoint - handled client-side only
          user: false, // Disable user endpoint - we get user from login response
        },
        token: {
          property: "token",
          maxAge: parseInt(process.env.AUTH_TOKEN_MAX_AGE) || 60 * 60 * 24 * 365, // 1 year
        },
        user: {
          property: "user", // Get user from login response
          autoFetch: process.env.VERIFY_ENDPOINT || "/api/spa/login/verify.php", // Disable auto fetch to prevent API calls
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
    base: process.env.ROUTER_BASE || "/homevisit/",
    mode: "hash", // ใช้ hash mode แทน history mode
    middleware: [],
  },
  // serverMiddleware: ["~/api"], // Disabled - API runs separately
  pwa: {
    meta: {
      title: process.env.APP_NAME || "Riped V2 Research",
      author: process.env.APP_AUTHOR || "Riped Team",
      description: process.env.APP_DESCRIPTION || "",
      theme_color: process.env.PWA_THEME_COLOR || "#3551a4",
      lang: process.env.APP_LANG || "th",
    },
    manifest: {
      name: process.env.APP_NAME || "Riped V2 Research",
      short_name: process.env.APP_SHORT_NAME || "Riped Research",
      description: process.env.APP_DESCRIPTION || "",
      theme_color: process.env.PWA_THEME_COLOR || "#3551a4",
      background_color: process.env.PWA_BACKGROUND_COLOR || "#ffffff",
      display: process.env.PWA_DISPLAY || "standalone",
      orientation: process.env.PWA_ORIENTATION || "portrait",
      scope: process.env.ROUTER_BASE || "/homevisit/",
      start_url: process.env.ROUTER_BASE || "/homevisit/",
      lang: process.env.APP_LANG || "th",
      icons: [
        {
          src: process.env.PWA_ICON || "/homevisit/logo.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: process.env.PWA_ICON || "/homevisit/logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      // ⚠️ PRODUCTION: เปลี่ยนเป็ true เพื่อเปิดใช้งาน service worker และ cache
      enabled: process.env.ENABLE_CACHE === "true" || process.env.NODE_ENV === "production", // เปิดใน production, ปิดใน development
      runtimeCaching: [
        {
          // API Cache - networkFirst (ลองเน็ตก่อน ถ้าไม่ได้ใช้ cache)
          urlPattern: `^${process.env.API_BASE_URL || "https://ripedresearch.org"}/.*`,
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
          // S3 Image Cache - staleWhileRevalidate (แสดง cache แล้วอัพเดทในพื้นหลัง)
          urlPattern: /^https:\/\/.*\.s3\..*\.amazonaws\.com\/.*/,
          handler: "staleWhileRevalidate",
          strategyOptions: {
            cacheName: "s3-image-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 วัน (ลดจาก 365 วัน)
              purgeOnQuotaError: true, // ลบ cache เก่าเมื่อพื้นที่เต็ม
            },
          },
        },
      ],
      // Register service worker
      autoRegister: true,
    },
  },
};
