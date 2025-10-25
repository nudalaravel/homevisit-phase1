export default function ({ app, store }, inject) {
  // ตัวจัดการ Authentication แบบ Offline
  class OfflineAuthManager {
    constructor() {
      this.setupAuthListeners();
    }

    setupAuthListeners() {
      // รอให้ auth module พร้อมใช้งาน
      const checkAuthModule = () => {
        if (store.state.auth) {
          // ฟังการเปลี่ยนแปลงสถานะ auth
          store.watch(
            (state) => state.auth.loggedIn,
            (loggedIn, oldLoggedIn) => {
              // บันทึกเมื่อมีการเปลี่ยนจาก false เป็น true (เพื่อหลีกเลี่ยงการบันทึกซ้ำ)
              if (loggedIn && !oldLoggedIn) {
                // รอสักครู่เพื่อให้แน่ใจว่า token ถูก set แล้ว
                setTimeout(() => {
                  this.saveAuthData();
                }, 150);
              } else if (!loggedIn && oldLoggedIn) {
                // ล้างข้อมูลเมื่อ logout
                this.clearAuthData();
              }
            }
          );
        } else {
          // ลองใหม่หลังจากรอสักครู่
          setTimeout(checkAuthModule, 100);
        }
      };

      checkAuthModule();
    }

    // บันทึกข้อมูล authentication สำหรับการเข้าถึงแบบ offline
    saveAuthData() {
      try {
        if (!store.state.auth) return;

        // ดึงข้อมูล user และแปลงเป็น plain object (ลบ Vue reactivity)
        const userData = store.state.auth.user;
        const plainUser = userData
          ? JSON.parse(JSON.stringify(userData))
          : null;

        // ตรวจสอบว่าข้อมูล user ถูกต้อง (ไม่ใช่ object ว่าง)
        if (!plainUser || Object.keys(plainUser).length === 0) {
          return;
        }

        // ดึง token จากหลายแหล่ง
        let token = null;

        // ลองดึงจาก strategy ก่อน
        if (store.state.auth.strategy?.token) {
          token = store.state.auth.strategy.token.get();
        }

        // ถ้ายังเป็น null ให้ลองดึงจาก localStorage
        if (!token && typeof localStorage !== "undefined") {
          token = localStorage.getItem("auth._token.local");
          // ลบ 'Bearer ' prefix ถ้ามี
          if (token && token.startsWith("Bearer ")) {
            token = token.substring(7);
          }
        }

        const authData = {
          user: plainUser,
          token: token,
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem("offline_auth_data", JSON.stringify(authData));
      } catch (error) {
        console.error("Failed to save auth data:", error);
      }
    }

    // โหลดข้อมูล authentication สำหรับการเข้าถึงแบบ offline
    loadAuthData() {
      try {
        const saved = localStorage.getItem("offline_auth_data");
        if (saved) {
          const authData = JSON.parse(saved);

          // ตรวจสอบว่า token ยังใช้ได้อยู่หรือไม่ (1 ปี)
          const tokenAge = Date.now() - new Date(authData.timestamp).getTime();
          const oneYear = 365 * 24 * 60 * 60 * 1000;

          if (tokenAge < oneYear) {
            return authData;
          } else {
            this.clearAuthData();
            return null;
          }
        }
      } catch (error) {
        console.error("Failed to load auth data:", error);
        this.clearAuthData();
      }
      return null;
    }

    // ล้างข้อมูล authentication
    clearAuthData() {
      try {
        localStorage.removeItem("offline_auth_data");
      } catch (error) {
        console.error("Failed to clear auth data:", error);
      }
    }

    // ตรวจสอบว่า user สามารถ login แบบ offline ได้หรือไม่
    canLoginOffline() {
      const authData = this.loadAuthData();
      return authData !== null;
    }

    // Login แบบ offline โดยใช้ข้อมูลที่บันทึกไว้
    async loginOffline() {
      const authData = this.loadAuthData();

      if (!authData) {
        throw new Error("No offline authentication data available");
      }

      try {
        if (!store.state.auth) {
          throw new Error("Auth module not ready");
        }

        // ตั้งค่าสถานะ auth โดยไม่ต้องเรียก API
        store.commit("auth/SET", ["loggedIn", true]);
        store.commit("auth/SET", ["user", authData.user]);
        store.commit("auth/SET", ["strategy", "local"]);

        // ตั้งค่า token ใน auth strategy
        if (store.state.auth.strategy && store.state.auth.strategy.token) {
          store.state.auth.strategy.token.set(authData.token);
        }

        return true;
      } catch (error) {
        console.error("Offline login failed:", error);
        throw error;
      }
    }

    // ฟังก์ชัน Login - ใช้ได้เฉพาะ online เท่านั้น
    async login(credentials) {
      // ตรวจสอบว่าออนไลน์หรือไม่ - login ได้เฉพาะตอนออนไลน์เท่านั้น
      if (!navigator.onLine) {
        throw new Error(
          "ไม่สามารถเข้าสู่ระบบได้ในโหมดออฟไลน์ กรุณาเชื่อมต่ออินเทอร์เน็ต"
        );
      }

      // Login แบบ online - ใช้ Nuxt Auth module พร้อมการจัดการ response ที่กำหนดเอง
      try {
        // ใช้ $auth.loginWith สำหรับ Nuxt Auth module
        const result = await app.$auth.loginWith("local", {
          data: {
            username: credentials.username,
            password: credentials.password,
          },
        });

        // หมายเหตุ: saveAuthData() จะถูกเรียกอัตโนมัติโดย setupAuthListeners()
        // เมื่อสถานะ loggedIn เปลี่ยนเป็น true
        return result;
      } catch (error) {
        if (error.response && error.response.data) {
          throw new Error(
            error.response.data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
          );
        }
        throw error;
      }
    }

    // ฟังก์ชัน Logout - ใช้ได้ทั้ง online และ offline
    async logout() {
      try {
        // ขั้นตอนที่ 1: ล้างสถานะ auth ใน Vuex ก่อนเพื่อป้องกันปัญหา middleware
        if (store.state.auth) {
          store.commit("auth/SET", ["loggedIn", false]);
          store.commit("auth/SET", ["user", null]);
          store.commit("auth/SET", ["strategy", null]);
        }

        // ขั้นตอนที่ 2: ล้าง token จาก auth strategy
        if (store.state.auth?.strategy?.token) {
          try {
            store.state.auth.strategy.token.reset();
          } catch (e) {
            // ข้ามถ้า reset ไม่ได้
          }
        }

        // ขั้นตอนที่ 3: ล้างข้อมูล auth ทั้งหมดใน localStorage
        if (typeof localStorage !== "undefined") {
          const authItems = [
            "auth._token.local",
            "auth._refresh_token.local",
            "auth.strategy",
            "offline_auth_data",
          ];

          authItems.forEach((item) => {
            try {
              localStorage.removeItem(item);
            } catch (e) {
              // ข้ามถ้าลบไม่ได้
            }
          });
        }

        // ขั้นตอนที่ 4: ล้าง cookies ที่เกี่ยวข้องกับ auth ทั้งหมด
        if (typeof document !== "undefined") {
          const cookiesToClear = [
            "auth._token.local",
            "auth._refresh_token.local",
            "auth.strategy",
            "auth._token_expiration.local",
          ];

          cookiesToClear.forEach((cookieName) => {
            try {
              // ล้าง cookie โดยตั้งค่าวันหมดอายุให้เป็นอดีต
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            } catch (e) {
              // ข้ามถ้าล้างไม่ได้
            }
          });
        }

        // ขั้นตอนที่ 5: รอสักครู่เพื่อให้แน่ใจว่าการดำเนินการทั้งหมดเสร็จสิ้น
        await new Promise((resolve) => setTimeout(resolve, 100));

        // ขั้นตอนที่ 6: Redirect ไปหน้า login พร้อม query param สำเร็จ
        if (app.router) {
          return app.router.push({
            path: "/login",
            query: { logout: "success" },
          });
        }

        return true;
      } catch (error) {
        console.error("Error during logout:", error);
        // ถึงแม้จะเกิด error ก็พยายาม redirect ไปหน้า login
        if (app.router) {
          return app.router.push("/login");
        }
        throw error;
      }
    }

    // ดึงข้อมูล user ปัจจุบัน
    getUser() {
      // ลองดึงจาก Vuex store ก่อน (in-memory)
      if (
        store.state.auth?.user &&
        Object.keys(store.state.auth.user).length > 0
      ) {
        return store.state.auth.user;
      }

      // ถ้าไม่มีใน store ให้ลองโหลดจาก offline data
      const authData = this.loadAuthData();
      return authData?.user || null;
    }

    // ดึง property เฉพาะของ user
    getUserProperty(property) {
      const user = this.getUser();
      return user ? user[property] : null;
    }

    // ตรวจสอบสถานะ authentication
    getAuthStatus() {
      return {
        isLoggedIn: store.state.auth?.loggedIn || false,
        user: this.getUser(),
        canLoginOffline: this.canLoginOffline(),
        isOnline: navigator.onLine,
      };
    }
  }

  // สร้าง instance ของ offline auth manager
  const offlineAuth = new OfflineAuthManager();

  // Inject เข้าไปใน Vue instance
  inject("offlineAuth", offlineAuth);

  // เริ่มต้น offline auth เมื่อแอปเริ่มทำงาน
  if (process.client) {
    // รอให้ auth module พร้อมก่อนที่จะพยายาม restore auth
    const initializeOfflineAuth = () => {
      if (store.state.auth) {
        // พยายาม restore สถานะ authentication เมื่อเปิดแอป
        if (!store.state.auth.loggedIn && offlineAuth.canLoginOffline()) {
          offlineAuth.loginOffline().catch((error) => {
            console.error("Failed to restore offline auth:", error);
          });
        }
      } else {
        // ลองใหม่หลังจากรอสักครู่
        setTimeout(initializeOfflineAuth, 100);
      }
    };

    initializeOfflineAuth();
  }
}
