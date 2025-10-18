# ระบบ Authentication (Auth System)

## สรุปการทำงาน

ระบบ Authentication ที่รองรับทั้งโหมด Online และ Offline พร้อมการเก็บสถานะถาวร

---

## 📋 ข้อกำหนดหลัก

### 1. ✅ Login ผ่านได้เฉพาะ Online เท่านั้น

- การ Login **ต้องมีการเชื่อมต่ออินเทอร์เน็ต**
- ถ้าไม่มีอินเทอร์เน็ต จะแสดงข้อความ "ไม่สามารถเข้าสู่ระบบได้ในโหมดออฟไลน์"
- ป้องกันการ Login ปลอมในโหมด Offline

### 2. ✅ เก็บสถานะ Login ถาวร

- เมื่อ Login สำเร็จ ระบบจะบันทึก:
  - ข้อมูล User
  - Token
  - Timestamp
- สถานะ Login จะคงอยู่แม้:
  - ปิดเบราว์เซอร์
  - รีเฟรชหน้า
  - อยู่ในโหมด Offline
- ระบบจะ restore สถานะ Login อัตโนมัติเมื่อเปิดแอปใหม่

### 3. ✅ Logout ล้างข้อมูลทั้งหมด

- ล้าง Vuex Store (loggedIn, user, strategy)
- ล้าง localStorage ทั้งหมด
- ล้าง Cookies ทั้งหมด
- ล้าง offline_auth_data
- Redirect ไปหน้า Login

---

## 🔧 ไฟล์ที่เกี่ยวข้อง

### 1. `plugins/auth-custom.js`

**หน้าที่:** จัดการ Response/Request Interceptor สำหรับ Login API

#### การทำงาน:

```javascript
// Response Interceptor
- ตรวจสอบว่า response.data เป็น object (แก้ไข "in operator" error)
- ถ้า login สำเร็จ (statusCode = 200 และมี token):
  → แปลงเป็นรูปแบบ { token, user }
- ถ้า login ไม่สำเร็จ (ไม่มี token):
  → throw Error

// Request Interceptor
- แปลงรูปแบบ request data ให้ตรงกับ API
```

### 2. `plugins/auth-offline.js`

**หน้าที่:** จัดการ Authentication ทั้งหมด (Online/Offline)

#### ฟังก์ชันหลัก:

##### `login(credentials)` - Login (Online เท่านั้น)

```javascript
// ✅ เช็คว่า online ก่อน
if (!navigator.onLine) {
  throw new Error("ไม่สามารถเข้าสู่ระบบได้ในโหมดออฟไลน์");
}

// เรียก API Login
await app.$auth.loginWith("local", { data: credentials });

// บันทึกข้อมูลสำหรับ offline
this.saveAuthData();
```

##### `saveAuthData()` - บันทึกข้อมูล Auth

```javascript
const authData = {
  user: store.state.auth.user, // ข้อมูล User
  token: token, // Token
  timestamp: new Date().toISOString(),
};
localStorage.setItem("offline_auth_data", JSON.stringify(authData));
```

##### `loginOffline()` - Restore สถานะ Login (Auto)

```javascript
// โหลดข้อมูลจาก localStorage
const authData = this.loadAuthData();

// Restore ลง Vuex Store
store.commit("auth/SET", ["loggedIn", true]);
store.commit("auth/SET", ["user", authData.user]);
store.commit("auth/SET", ["strategy", "local"]);
```

##### `logout()` - ออกจากระบบ

```javascript
// 1. Clear Vuex Store
store.commit("auth/SET", ["loggedIn", false]);
store.commit("auth/SET", ["user", null]);
store.commit("auth/SET", ["strategy", null]);

// 2. Clear localStorage
localStorage.removeItem("auth._token.local");
localStorage.removeItem("auth._refresh_token.local");
localStorage.removeItem("auth.strategy");
localStorage.removeItem("offline_auth_data");

// 3. Clear Cookies
document.cookie = "auth._token.local=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
document.cookie = "auth._refresh_token.local=; expires=...";
document.cookie = "auth.strategy=; expires=...";

// 4. Redirect
router.push("/login?logout=success");
```

##### `getUser()` - เข้าถึงข้อมูล User

```javascript
// ลองเอาจาก Vuex ก่อน (in-memory)
if (store.state.auth?.user) {
  return store.state.auth.user;
}

// ถ้าไม่มี ลองโหลดจาก offline data
const authData = this.loadAuthData();
return authData?.user || null;
```

##### `getUserProperty(property)` - เข้าถึง Property เฉพาะ

```javascript
const user = this.getUser();
return user ? user[property] : null;
```

### 3. `middleware/auth.js`

**หน้าที่:** ป้องกันหน้าที่ต้อง Login

#### การทำงาน:

```javascript
// 1. เช็คว่า auth module พร้อม
if (!store.state.auth) {
  return redirect("/login");
}

// 2. เช็คว่า logged in และมี user data
if (!isAuthenticated || !hasUser) {
  return redirect("/login");
}

// 3. ผ่าน - อนุญาตให้เข้าถึงหน้านั้น
```

### 4. `pages/login.vue`

**หน้าที่:** หน้า Login UI

#### การทำงาน:

```javascript
// เมื่อ submit form
async handleLogin() {
  // เรียก offline auth manager
  await this.$offlineAuth.login({
    username: this.form.username,
    password: this.form.password
  })

  // แสดง toast success
  this.$toast.success('เข้าสู่ระบบสำเร็จ')

  // Redirect ไปหน้าแรก
  this.$router.push('/')
}
```

### 5. `layouts/admin.vue`

**หน้าที่:** Layout หลัก + ปุ่ม Logout

#### การทำงาน:

```javascript
async logout() {
  await this.$offlineAuth.logout()
}
```

---

## 📱 การใช้งานใน Component

### 1. เข้าถึงข้อมูล User

```javascript
// วิธีที่ 1: ผ่าน $auth (Nuxt Auth)
export default {
  mounted() {
    console.log(this.$auth.user)
    console.log(this.$auth.loggedIn)
  }
}

// วิธีที่ 2: ผ่าน $offlineAuth (รองรับ offline)
export default {
  mounted() {
    const user = this.$offlineAuth.getUser()
    console.log('User:', user)
    console.log('Username:', user.username)
    console.log('Email:', user.email)
  }
}

// วิธีที่ 3: ผ่าน Vuex Store
export default {
  computed: {
    currentUser() {
      return this.$store.state.auth?.user
    },
    isLoggedIn() {
      return this.$store.state.auth?.loggedIn
    }
  }
}
```

### 2. เข้าถึง Property เฉพาะ

```javascript
export default {
  methods: {
    getUserInfo() {
      // เอา property เฉพาะ
      const username = this.$offlineAuth.getUserProperty("username");
      const prefix = this.$offlineAuth.getUserProperty("prefix");
      const projectid = this.$offlineAuth.getUserProperty("projectid");
      const level = this.$offlineAuth.getUserProperty("level");

      console.log({ username, prefix, projectid, level });

      // ตัวอย่างผลลัพธ์:
      // {
      //   username: "0612066440",
      //   prefix: "MKM",
      //   projectid: "15",
      //   level: 2
      // }
    },
  },
};
```

### 3. เช็คสถานะ Auth

```javascript
export default {
  methods: {
    checkAuth() {
      const status = this.$offlineAuth.getAuthStatus();

      console.log("Logged in:", status.isLoggedIn);
      console.log("User:", status.user);
      console.log("Can login offline:", status.canLoginOffline);
      console.log("Is online:", status.isOnline);
    },
  },
};
```

### 4. แสดงข้อมูล User ใน Template

```vue
<template>
  <div>
    <!-- แสดงชื่อผู้ใช้ (เบอร์โทร) -->
    <span v-if="$auth.user">
      {{ $auth.user.username }}
    </span>

    <!-- แสดง prefix และ project -->
    <div v-if="currentUser">
      <p>เบอร์โทร: {{ currentUser.username }}</p>
      <p>โครงการ: {{ currentUser.prefix }}</p>
      <p>Project ID: {{ currentUser.projectid }}</p>
      <p>ระดับสิทธิ์: {{ currentUser.level }}</p>
    </div>

    <!-- เช็คสิทธิ์ตาม level -->
    <div v-if="isAdmin">
      <button>ปุ่มสำหรับ Admin</button>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    currentUser() {
      return this.$offlineAuth.getUser();
    },
    isAdmin() {
      // สมมติว่า level 1 = admin
      return this.currentUser?.level === 1;
    },
    userPhone() {
      return this.$offlineAuth.getUserProperty("username");
    },
    projectPrefix() {
      return this.$offlineAuth.getUserProperty("prefix");
    },
  },
};
</script>
```

### 5. Logout

```javascript
export default {
  methods: {
    async handleLogout() {
      try {
        await this.$offlineAuth.logout();
        // จะ redirect ไป /login อัตโนมัติ
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
};
```

---

## 🔐 โครงสร้างข้อมูล

### ข้อมูลที่เก็บใน localStorage

```javascript
// offline_auth_data
{
  "user": {
    "username": "0612066440",  // เบอร์โทรศัพท์ที่ใช้ login
    "prefix": "MKM",           // รหัสโครงการ/prefix
    "projectid": "15",         // ID โครงการ
    "level": 2                 // ระดับสิทธิ์ (1=admin, 2=user, etc.)
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjA2MTIwNjY0NDAiLCJwcmVmaXgiOiJNS00iLCJwcm9qZWN0aWQiOiIxNSIsImxldmVsIjoyLCJpYXQiOjE3NjA1NDMzOTEsImV4cCI6MTc2MDU3MjE5MX0.Dr2-vZ0sBNvsqp4eGU2ogQyXwa_EFYooUf_xlBsX5Z8",
  "timestamp": "2025-10-15T10:30:00.000Z"
}
```

### ข้อมูลที่เก็บใน Vuex Store

```javascript
// state.auth
{
  "loggedIn": true,
  "user": {
    "username": "0612066440",
    "prefix": "MKM",
    "projectid": "15",
    "level": 2
  },
  "strategy": "local"
}
```

### API Response Format (ตัวอย่าง)

```javascript
// Response จาก /api/spa/login/login.php
{
  "message": "done",
  "statusCode": 200,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "0612066440",
    "prefix": "MKM",
    "projectid": "15",
    "level": 2
  }
}
```

---

## 🚀 Flow การทำงาน

### Login Flow (Online Only)

```
1. User กรอก username/password
2. กด submit
3. ✅ เช็ค navigator.onLine
   - ถ้า offline → แสดง error "ไม่สามารถเข้าสู่ระบบได้ในโหมดออฟไลน์"
   - ถ้า online → ดำเนินการต่อ
4. เรียก API login
5. ✅ auth-custom.js ตรวจสอบ response:
   - ถ้ามี token → แปลงเป็น { token, user }
   - ถ้าไม่มี token → throw error
6. บันทึก token + user ลง Vuex Store
7. บันทึก offline_auth_data ลง localStorage
8. Redirect ไป /
```

### App Startup Flow

```
1. เปิดแอป
2. auth-offline.js ทำงานอัตโนมัติ:
   - เช็ค localStorage มี offline_auth_data หรือไม่
   - เช็ค token หมดอายุหรือไม่ (1 ปี)
   - ถ้ามีและยังไม่หมดอายุ → restore สถานะ login
3. ถ้า restore สำเร็จ:
   - Set loggedIn = true
   - Set user data
   - สามารถใช้งานแอปได้ (แม้ offline)
4. ถ้าไม่มีหรือหมดอายุ:
   - ต้อง login ใหม่ (online เท่านั้น)
```

### Middleware Check Flow

```
1. User พยายามเข้าหน้าที่ต้อง auth
2. middleware/auth.js ทำงาน:
   - เช็ค loggedIn = true
   - เช็คมี user data
   - ถ้าผ่านทั้งหมด → อนุญาต
   - ถ้าไม่ผ่าน → redirect /login
```

### Logout Flow

```
1. User กดปุ่ม logout
2. เรียก $offlineAuth.logout()
3. ล้างข้อมูลทั้งหมด:
   ✅ Vuex Store (loggedIn, user, strategy)
   ✅ localStorage (auth._token.local, offline_auth_data, etc.)
   ✅ Cookies (auth._token.local, etc.)
4. Redirect ไป /login?logout=success
5. แสดง toast "ออกจากระบบสำเร็จ"
```

---

## ✅ ทดสอบระบบ

### Test Case 1: Login Online

```
1. เปิดแอป (มีอินเทอร์เน็ต)
2. Login ด้วย username/password ที่ถูกต้อง
3. ✅ Login สำเร็จ → redirect ไป /
4. ✅ แสดงข้อมูล user
5. ✅ localStorage มี offline_auth_data
```

### Test Case 2: Login Offline (ควรไม่ได้)

```
1. ปิดอินเทอร์เน็ต
2. พยายาม Login
3. ✅ แสดง error "ไม่สามารถเข้าสู่ระบบได้ในโหมดออฟไลน์"
4. ✅ Login ไม่ผ่าน
```

### Test Case 3: เก็บสถานะถาวร

```
1. Login สำเร็จ (online)
2. ปิดเบราว์เซอร์
3. เปิดแอปใหม่
4. ✅ ยังคง login อยู่
5. ✅ แสดงข้อมูล user ได้
6. ปิดอินเทอร์เน็ต
7. ✅ ยังคง login อยู่
8. ✅ สามารถใช้งานแอปได้
```

### Test Case 4: Logout ล้างทุกอย่าง

```
1. Login สำเร็จ
2. กด logout
3. ✅ redirect ไป /login
4. ✅ ไม่มีข้อมูล user
5. ✅ localStorage ไม่มี offline_auth_data
6. ✅ loggedIn = false
7. พยายามเข้า / โดยตรง
8. ✅ redirect ไป /login
```

### Test Case 5: เข้าถึงข้อมูล User

```javascript
// ทดสอบใน component
mounted() {
  // Method 1
  console.log(this.$auth.user)

  // Method 2
  console.log(this.$offlineAuth.getUser())

  // Method 3
  console.log(this.$offlineAuth.getUserProperty('username'))

  // Method 4
  console.log(this.$store.state.auth.user)
}
```

---

## 🎯 สรุป

| ข้อกำหนด             | สถานะ | หมายเหตุ                                |
| -------------------- | ----- | --------------------------------------- |
| Login ผ่านแค่ online | ✅    | ตรวจสอบ navigator.onLine                |
| เก็บสถานะถาวร        | ✅    | ใช้ localStorage + auto restore         |
| Logout ล้างทั้งหมด   | ✅    | ล้าง Vuex, localStorage, Cookies        |
| เข้าถึงข้อมูล User   | ✅    | มีหลายวิธี ($auth, $offlineAuth, store) |
| ใช้งาน offline       | ✅    | คง login state แม้ offline              |

---

## 📝 หมายเหตุ

1. **Token Expiration**: Token จะหมดอายุใน 1 ปี (กำหนดใน nuxt.config.js)
2. **Auto Restore**: ระบบจะ restore สถานะ login อัตโนมัติทุกครั้งที่เปิดแอป
3. **Offline Support**: แอปทำงานได้แม้ offline หลังจาก login แล้ว
4. **Security**: Login ต้องมีอินเทอร์เน็ตเสมอ เพื่อความปลอดภัย
5. **User Data**: สามารถเข้าถึงข้อมูล user ได้หลายวิธี เลือกใช้ตามความเหมาะสม

---

## 💡 ข้อมูล User Fields

| Field       | ประเภท | คำอธิบาย                  | ตัวอย่าง     |
| ----------- | ------ | ------------------------- | ------------ |
| `username`  | string | เบอร์โทรศัพท์ที่ใช้ login | "0612066440" |
| `prefix`    | string | รหัสโครงการ/prefix        | "MKM"        |
| `projectid` | string | ID ของโครงการ             | "15"         |
| `level`     | number | ระดับสิทธิ์ผู้ใช้         | 1, 2, 3, ... |

### ตัวอย่างการใช้งาน User Data

```javascript
// ในหน้า survey.vue หรือ index.vue
export default {
  computed: {
    // เอาข้อมูล user
    currentUser() {
      return this.$offlineAuth.getUser();
    },

    // เอาเบอร์โทรศัพท์
    userPhone() {
      return this.$offlineAuth.getUserProperty("username");
    },

    // เอารหัสโครงการ
    projectCode() {
      return this.$offlineAuth.getUserProperty("prefix");
    },

    // เอา project ID
    projectId() {
      return this.$offlineAuth.getUserProperty("projectid");
    },

    // เช็คสิทธิ์
    userLevel() {
      return this.$offlineAuth.getUserProperty("level");
    },

    isAdmin() {
      return this.userLevel === 1;
    },
  },

  methods: {
    // ใช้ข้อมูล user ในการบันทึก
    async saveData() {
      const data = {
        username: this.userPhone,
        projectid: this.projectId,
        prefix: this.projectCode,
        // ... ข้อมูลอื่นๆ
      };

      await this.$axios.post("/api/save", data);
    },
  },
};
```
