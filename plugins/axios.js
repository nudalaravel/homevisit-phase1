export default function ({ $axios, redirect, app, store }) {
  // Flag เพื่อป้องกันการ logout ซ้ำหลายครั้งพร้อมกัน
  let isHandlingTokenExpired = false;

  // ตั้งค่า axios เพื่อ bypass CORS
  $axios.defaults.withCredentials = true;
  $axios.defaults.headers.common["Accept"] = "application/json";
  $axios.defaults.headers.common["Content-Type"] = "application/json";

  $axios.onRequest((config) => {
    console.log("Making request to " + config.url);

    // เพิ่ม headers สำหรับ bypass CORS
    config.withCredentials = true;

    return config;
  });

  $axios.onResponse((response) => {
    console.log("Response received:", response.status);

    // ตรวจสอบ response message แม้ว่า status จะเป็น 200
    if (response.data && response.data.message) {
      const message = response.data.message.toLowerCase();
      if (
        message.includes("token invalid") ||
        message.includes("token expired")
      ) {
        console.warn("🚫 Token invalid or expired detected in response");
        handleTokenExpired();
        // Reject ด้วย error เพื่อป้องกันการประมวลผลต่อ
        return Promise.reject(new Error("Token invalid or expired"));
      }
    }

    return response;
  });

  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status);

    // ตรวจสอบ error 401
    if (code === 401) {
      console.warn("🚫 401 Unauthorized detected");
      handleTokenExpired();
      return Promise.reject(error);
    }

    // ตรวจสอบ message ใน error response
    if (error.response && error.response.data && error.response.data.message) {
      const message = error.response.data.message.toLowerCase();
      if (
        message.includes("token invalid") ||
        message.includes("token expired")
      ) {
        console.warn("🚫 Token invalid or expired detected in error response");
        handleTokenExpired();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  });

  // ฟังก์ชันจัดการเมื่อ token หมดอายุ
  async function handleTokenExpired() {
    // ป้องกันการเรียกใช้งานซ้ำ
    if (isHandlingTokenExpired) {
      console.log("⏭️ Already handling token expiration, skipping...");
      return;
    }

    isHandlingTokenExpired = true;

    try {
      console.log("🔐 Handling token expiration...");

      // ล้างข้อมูล auth
      if (app.$auth && app.$auth.loggedIn) {
        console.log("📤 Logging out...");
        await app.$auth.logout();
      }

      // ล้าง offline auth data
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("offline_auth_data");
        localStorage.removeItem("auth._token.local");
        console.log("🗑️ Cleared offline auth data");
      }

      // ล้างข้อมูลใน store
      if (store) {
        store.commit("setOnline", navigator.onLine);
      }

      // แสดงข้อความแจ้งเตือน
      if (app.$toast) {
        app.$toast.warning("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      }

      // Redirect ไปหน้า login
      console.log("🔄 Redirecting to login...");
      redirect("/login");

      // Reset flag หลังจาก redirect (เผื่อกรณีที่ redirect ไม่สำเร็จ)
      setTimeout(() => {
        isHandlingTokenExpired = false;
      }, 2000);
    } catch (err) {
      console.error("❌ Error handling token expiration:", err);
      // Redirect ไปหน้า login แม้จะเกิด error
      redirect("/login");
      // Reset flag
      setTimeout(() => {
        isHandlingTokenExpired = false;
      }, 2000);
    }
  }
}
