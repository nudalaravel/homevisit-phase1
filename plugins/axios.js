export default function ({ $axios, redirect, app, store }) {
  // Flag เพื่อป้องกันการแสดง warning ซ้ำ
  let lastWarningTime = 0;
  const warningCooldown = 5000; // 5 วินาที

  // ตั้งค่า axios เพื่อ bypass CORS
  $axios.defaults.withCredentials = true;
  $axios.defaults.headers.common["Accept"] = "application/json";
  $axios.defaults.headers.common["Content-Type"] = "application/json";

  $axios.onRequest((config) => {
    // เพิ่ม headers สำหรับ bypass CORS
    config.withCredentials = true;

    return config;
  });

  $axios.onResponse((response) => {
    // ตรวจสอบ response message แม้ว่า status จะเป็น 200
    if (response.data && response.data.message) {
      const message = response.data.message.toLowerCase();
      if (
        message.includes("token invalid") ||
        message.includes("token expired")
      ) {
        showApiWarning("เซสชันอาจหมดอายุ กรุณาตรวจสอบการเชื่อมต่อ");
        // ไม่ reject เพื่อให้ระบบทำงานต่อได้
      }
    }

    return response;
  });

  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status);

    // ตรวจสอบ error 401 - แสดง warning แทนการ logout
    if (code === 401) {
      showApiWarning("ไม่สามารถเข้าถึงข้อมูลได้ กรุณาตรวจสอบสิทธิ์การใช้งาน");
      return Promise.reject(error);
    }

    // ตรวจสอบ error 403 - Forbidden
    if (code === 403) {
      showApiWarning("ไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
      return Promise.reject(error);
    }

    // ตรวจสอบ timeout
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      showApiWarning("การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง");
      return Promise.reject(error);
    }

    // ตรวจสอบ message ใน error response
    if (error.response && error.response.data && error.response.data.message) {
      const message = error.response.data.message.toLowerCase();
      if (
        message.includes("token invalid") ||
        message.includes("token expired")
      ) {
        showApiWarning("เซสชันอาจหมดอายุ กรุณาตรวจสอบการเชื่อมต่อ");
      }
    }

    return Promise.reject(error);
  });

  // ฟังก์ชันแสดง warning โดยไม่ logout
  function showApiWarning(message) {
    const now = Date.now();

    // ป้องกันการแสดง warning ซ้ำภายในเวลาสั้นๆ
    if (now - lastWarningTime < warningCooldown) {
      return;
    }

    lastWarningTime = now;

    // แสดง toast warning
    if (app.$toast) {
      app.$toast.warning(message, {
        duration: 5000,
        position: "top-center",
      });
    }

    // เพิ่ม alert เผื่อ toast ไม่ทำงาน (optional)
    // if (typeof window !== 'undefined') {
    //   alert(message);
    // }
  }
}
