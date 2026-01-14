export default function ({ $auth, $axios, store, app }) {
  // ปรับแต่ง Response Interceptor สำหรับ Auth API
  $axios.onResponse((response) => {
    // จัดการรูปแบบ response ที่กำหนดเองสำหรับการ login
    if (
      response.config.url &&
      response.config.url.includes("/api/spa/login/login.php")
    ) {
      // ตรวจสอบให้แน่ใจว่า response.data เป็น object เพื่อป้องกัน 'in' operator errors
      if (!response.data || typeof response.data !== "object") {
        response.data = {};
      }

      // ตรวจสอบว่า login สำเร็จหรือไม่
      // รองรับ level 1, 2 และ 3
      if (
        response.data.statusCode === 200 &&
        response.data.token &&
        response.data.user &&
        (response.data.user.level === 1 || response.data.user.level === 2 || response.data.user.level === 3)
      ) {
        // เก็บข้อมูล user และ token ก่อนแปลง response
        const userData = response.data.user || {};
        const token = response.data.token;

        // แปลง response ให้ตรงกับรูปแบบที่ Nuxt Auth ต้องการ
        response.data = {
          token: token,
          user: userData,
        };

        // บันทึกลง localStorage ทันทีเพื่อใช้งานแบบ offline
        if (
          typeof localStorage !== "undefined" &&
          userData &&
          Object.keys(userData).length > 0
        ) {
          const offlineAuthData = {
            user: userData,
            token: token,
            timestamp: new Date().toISOString(),
          };

          localStorage.setItem(
            "offline_auth_data",
            JSON.stringify(offlineAuthData)
          );
        }

        // ตั้งค่า user data ลง auth store ทันที (ไม่รอ setTimeout)
        // เพื่อให้ middleware สามารถเข้าถึง user level ได้ทันที
        if ($auth && userData && Object.keys(userData).length > 0) {
          console.log("Auth-custom: Setting user data:", {
            username: userData.username,
            level: userData.level,
            userData: userData
          });
          
          // Set user immediately using $auth.setUser
          $auth.setUser(userData);
          
          // Also set directly in store to ensure it's available immediately
          // Use the store from plugin context, not $auth.$store
          if (store && store.state && store.state.auth) {
            store.commit("auth/SET", ["user", userData]);
            store.commit("auth/SET", ["loggedIn", true]);
            
            console.log("Auth-custom: User set directly in store:", {
              username: userData.username,
              level: userData.level,
              storeUser: store.state.auth.user,
              storeUserLevel: store.state.auth.user?.level
            });
          } else {
            console.warn("Auth-custom: Store not available for direct set");
          }
          
          // Double check after a short delay to ensure it's set
          setTimeout(() => {
            const currentUser = store?.state?.auth?.user;
            const currentLevel = currentUser?.level;
            console.log("Auth-custom: Verification after setUser:", {
              hasUser: !!currentUser,
              userLevel: currentLevel,
              user: currentUser
            });
            
            // If level is still missing, set it again
            if (currentUser && currentLevel === undefined && userData.level !== undefined) {
              console.warn("Auth-custom: User level missing, setting again");
              store.commit("auth/SET", ["user", { ...currentUser, level: userData.level }]);
            }
          }, 100);
        }
      } else {
        // Login ไม่สำเร็จ - โยน error ให้ auth module จัดการ
        throw new Error(response.data.message || "Login failed");
      }
    }
    return response;
  });

  // ปรับแต่ง Request Interceptor สำหรับ Auth API
  $axios.onRequest((config) => {
    // จัดการรูปแบบ request ที่กำหนดเองสำหรับการ login
    if (config.url && config.url.includes("/api/spa/login/login.php")) {
      // แปลงรูปแบบ request data
      if (config.data && config.data.data) {
        config.data = {
          username: config.data.data.username,
          password: config.data.data.password,
        };
      }
    }
    return config;
  });
}
