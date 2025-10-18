# 🔐 Token Expiration Handler Documentation

## ภาพรวม

ระบบจัดการ Token Expiration อัตโนมัติ เพื่อป้องกันการใช้งาน API ด้วย token ที่หมดอายุ โดยจะทำการ logout และ redirect ไปหน้า login ทันทีเมื่อตรวจพบ

## 🎯 เงื่อนไขที่ทำให้เกิด Auto Logout

ระบบจะทำการ logout อัตโนมัติเมื่อ:

### 1. HTTP Status 401 (Unauthorized)

```
HTTP/1.1 401 Unauthorized
```

### 2. Response Message บ่งบอกว่า Token หมดอายุ

```json
{
  "message": "Token invalid or expired"
}
```

หรือ message ที่มีคำว่า:

- `"token invalid"`
- `"token expired"`
- `"Token Invalid"`
- `"TOKEN EXPIRED"`
  (ไม่สนใจตัวพิมพ์เล็ก-ใหญ่)

## 📋 ขั้นตอนการทำงาน

เมื่อตรวจพบ token หมดอายุ ระบบจะทำงานตามลำดับดังนี้:

```
┌─────────────────────────────────────┐
│ 1. ตรวจสอบ Response/Error           │
│    - Status 401?                    │
│    - Message มี "token invalid"?    │
│    - Message มี "token expired"?    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 2. ตรวจสอบ Flag isHandlingTokenExpired│
│    - ถ้า true = กำลังประมวลผลอยู่แล้ว│
│    - ถ้า false = เริ่มทำงาน          │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 3. Set Flag = true                  │
│    (ป้องกันการ logout ซ้ำ)         │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 4. Logout ผ่าน app.$auth.logout()  │
│    - ล้างข้อมูลใน auth store       │
│    - ล้าง token ใน memory          │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 5. ล้าง localStorage                │
│    - offline_auth_data              │
│    - auth._token.local              │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 6. แสดง Toast Warning               │
│    "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"│
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 7. Redirect to /login               │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 8. Reset Flag หลัง 2 วินาที        │
│    (เผื่อ redirect ไม่สำเร็จ)       │
└─────────────────────────────────────┘
```

## 🔍 ตัวอย่างการทำงาน

### กรณีที่ 1: API Response กลับมาเป็น 401

**Request:**

```javascript
await $axios.$get(
  "/api/parenting2025_census/get/homevisit/getchildsample.php?homevisitor=0612066440"
);
```

**Response:**

```
HTTP/1.1 401 Unauthorized
{
  "message": "Token expired",
  "statusCode": 401
}
```

**Console Log:**

```
Making request to /api/parenting2025_census/get/homevisit/getchildsample.php?homevisitor=0612066440
🚫 401 Unauthorized detected
🔐 Handling token expiration...
📤 Logging out...
🗑️ Cleared offline auth data
🔄 Redirecting to login...
```

**ผลลัพธ์:**

- ✅ ระบบ logout อัตโนมัติ
- ✅ แสดงข้อความ "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
- ✅ Redirect ไป `/login`

---

### กรณีที่ 2: API Response status 200 แต่มี message บอกว่า token invalid

**Request:**

```javascript
await $axios.$post("/api/parenting2025_census/put/homevisit/putdata_arr.php", {
  variable: [["tel", "address"]],
  value: [["0812345678", "123 ถนนสุขุมวิท"]],
  pk: [["stid"]],
  pkval: [["900601010105"]],
  tb: "homevisitor_sample_students",
});
```

**Response:**

```
HTTP/1.1 200 OK
{
  "message": "Token invalid or expired",
  "statusCode": 401
}
```

**Console Log:**

```
Making request to /api/parenting2025_census/put/homevisit/putdata_arr.php
Response received: 200
🚫 Token invalid or expired detected in response
🔐 Handling token expiration...
📤 Logging out...
🗑️ Cleared offline auth data
🔄 Redirecting to login...
```

**ผลลัพธ์:**

- ✅ ระบบ logout อัตโนมัติ
- ✅ แสดงข้อความ "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
- ✅ Redirect ไป `/login`

---

### กรณีที่ 3: หลาย Request พร้อมกัน และได้รับ 401 พร้อมกัน

**Request:**

```javascript
// ทำ 3 requests พร้อมกัน
Promise.all([
  $axios.$get("/api/endpoint1"),
  $axios.$get("/api/endpoint2"),
  $axios.$get("/api/endpoint3"),
]);
```

**Response:** ทั้ง 3 requests ได้รับ 401

**Console Log:**

```
Making request to /api/endpoint1
Making request to /api/endpoint2
Making request to /api/endpoint3
🚫 401 Unauthorized detected
🔐 Handling token expiration...
📤 Logging out...
🗑️ Cleared offline auth data
🔄 Redirecting to login...
🚫 401 Unauthorized detected
⏭️ Already handling token expiration, skipping...
🚫 401 Unauthorized detected
⏭️ Already handling token expiration, skipping...
```

**ผลลัพธ์:**

- ✅ Logout เพียง **1 ครั้ง** (ป้องกันการ logout ซ้ำ)
- ✅ แสดงข้อความเพียง **1 ครั้ง**
- ✅ Redirect เพียง **1 ครั้ง**

## 🛠️ การทำงานใน Code

### ไฟล์: `plugins/axios.js`

```javascript
export default function ({ $axios, redirect, app, store }) {
  // Flag เพื่อป้องกันการ logout ซ้ำ
  let isHandlingTokenExpired = false;

  // Response Interceptor
  $axios.onResponse((response) => {
    if (response.data && response.data.message) {
      const message = response.data.message.toLowerCase();
      if (
        message.includes("token invalid") ||
        message.includes("token expired")
      ) {
        handleTokenExpired();
        return Promise.reject(new Error("Token invalid or expired"));
      }
    }
    return response;
  });

  // Error Interceptor
  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status);

    // ตรวจสอบ error 401
    if (code === 401) {
      handleTokenExpired();
      return Promise.reject(error);
    }

    // ตรวจสอบ message ใน error response
    if (error.response?.data?.message) {
      const message = error.response.data.message.toLowerCase();
      if (
        message.includes("token invalid") ||
        message.includes("token expired")
      ) {
        handleTokenExpired();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  });

  async function handleTokenExpired() {
    if (isHandlingTokenExpired) return;
    isHandlingTokenExpired = true;

    try {
      // 1. Logout
      if (app.$auth?.loggedIn) {
        await app.$auth.logout();
      }

      // 2. Clear localStorage
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("offline_auth_data");
        localStorage.removeItem("auth._token.local");
      }

      // 3. Show toast
      if (app.$toast) {
        app.$toast.warning("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      }

      // 4. Redirect
      redirect("/login");
    } catch (err) {
      console.error("Error handling token expiration:", err);
      redirect("/login");
    } finally {
      setTimeout(() => {
        isHandlingTokenExpired = false;
      }, 2000);
    }
  }
}
```

## 🧪 การทดสอบ

### วิธีทดสอบในสภาพแวดล้อม Development

#### 1. ทดสอบด้วย Mock Response

สร้างไฟล์ `test-token-expiration.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test Token Expiration</title>
  </head>
  <body>
    <h1>Test Token Expiration Handler</h1>

    <button onclick="test401()">Test 401 Error</button>
    <button onclick="testInvalidMessage()">Test Invalid Message</button>
    <button onclick="testExpiredMessage()">Test Expired Message</button>

    <div id="result"></div>

    <script>
      async function test401() {
        try {
          // จำลอง API ที่ return 401
          const response = await fetch("/api/test-401-endpoint");
          document.getElementById(
            "result"
          ).innerHTML = `<p style="color: red;">Test Failed: Should have gotten 401</p>`;
        } catch (error) {
          document.getElementById(
            "result"
          ).innerHTML = `<p style="color: green;">✅ Caught 401 Error: ${error.message}</p>`;
        }
      }

      async function testInvalidMessage() {
        try {
          // จำลอง API ที่ return message "Token invalid"
          const response = await fetch("/api/test-endpoint", {
            headers: {
              Authorization: "Bearer expired-token",
            },
          });
          const data = await response.json();
          if (data.message && data.message.includes("Token invalid")) {
            document.getElementById(
              "result"
            ).innerHTML = `<p style="color: green;">✅ Detected Invalid Token Message</p>`;
          }
        } catch (error) {
          document.getElementById(
            "result"
          ).innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
      }

      async function testExpiredMessage() {
        try {
          // จำลอง API ที่ return message "Token expired"
          const response = await fetch("/api/test-endpoint", {
            headers: {
              Authorization: "Bearer old-token",
            },
          });
          const data = await response.json();
          if (data.message && data.message.includes("Token expired")) {
            document.getElementById(
              "result"
            ).innerHTML = `<p style="color: green;">✅ Detected Expired Token Message</p>`;
          }
        } catch (error) {
          document.getElementById(
            "result"
          ).innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
      }
    </script>
  </body>
</html>
```

#### 2. ทดสอบด้วย Backend Mock

แก้ไข Backend API ให้ return token expired:

```php
<?php
// สำหรับการทดสอบ
if ($_GET['test_expired'] === 'true') {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode([
        'message' => 'Token invalid or expired',
        'statusCode' => 401
    ]);
    exit;
}
?>
```

#### 3. ทดสอบด้วย Chrome DevTools

1. เปิด Chrome DevTools
2. ไปที่ Network tab
3. เลือก request ที่ต้องการทดสอบ
4. Right-click > Copy > Copy as cURL
5. แก้ไข token ให้หมดอายุ
6. Paste และ run ใน Terminal

## ⚠️ ข้อควรระวัง

### 1. การ Logout ซ้ำ

- ✅ ระบบป้องกันด้วย `isHandlingTokenExpired` flag
- ✅ หาก request หลายตัวได้รับ 401 พร้อมกัน จะ logout เพียงครั้งเดียว

### 2. Race Condition

- ✅ ใช้ async/await เพื่อให้ logout เสร็จก่อน redirect
- ✅ Reset flag หลัง 2 วินาที เผื่อ redirect ไม่สำเร็จ

### 3. Offline Mode

- ⚠️ ถ้า offline อยู่ จะไม่มี API error เกิดขึ้น
- ✅ ระบบใช้ offline auth data ที่เก็บไว้ใน localStorage

### 4. Multiple Tabs

- ⚠️ แต่ละ tab มี flag ของตัวเอง
- ✅ แต่ localStorage ถูก clear ทุก tab (เพราะใช้ localStorage ร่วมกัน)

## 🔗 ไฟล์ที่เกี่ยวข้อง

- `plugins/axios.js` - Axios interceptor (จัดการ token expiration)
- `plugins/auth-custom.js` - Custom auth logic
- `plugins/auth-offline.js` - Offline auth manager
- `store/index.js` - Vuex store (เก็บสถานะ online/offline)
- `pages/login.vue` - หน้า login

## 📊 สรุป

| ฟีเจอร์                           | สถานะ |
| --------------------------------- | ----- |
| **ตรวจสอบ 401 Error**             | ✅    |
| **ตรวจสอบ Token Invalid Message** | ✅    |
| **ตรวจสอบ Token Expired Message** | ✅    |
| **Auto Logout**                   | ✅    |
| **Clear localStorage**            | ✅    |
| **Show Toast Warning**            | ✅    |
| **Redirect to Login**             | ✅    |
| **ป้องกัน Logout ซ้ำ**            | ✅    |
| **Case Insensitive Message**      | ✅    |
| **Error Handling**                | ✅    |

## 🎉 ผลลัพธ์สุดท้าย

เมื่อ API response มี:

- ❌ **401 Unauthorized**
- ❌ **"Token invalid or expired"**

ระบบจะ:

1. ✅ Logout อัตโนมัติ
2. ✅ ล้างข้อมูล auth ทั้งหมด
3. ✅ แสดงข้อความเตือน
4. ✅ Redirect ไปหน้า login
5. ✅ พร้อมให้ user login ใหม่

**ผู้ใช้ไม่จำเป็นต้องทำอะไรเพิ่มเติม ระบบจัดการให้อัตโนมัติ! 🚀**
