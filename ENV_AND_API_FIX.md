# การแก้ไข Environment Variables และ API

## ปัญหาที่พบ

### 1. ไม่มีไฟล์ .env

- โปรเจคไม่มีไฟล์ `.env` สำหรับกำหนดค่า environment variables
- ไม่สามารถกำหนด PORT ได้

### 2. API Routes ไม่ทำงาน

- API routes ใน `api/index.js` ใช้ prefix `/api/` ซ้ำกับ Nuxt serverMiddleware
- ทำให้ URL เป็น `/api/api/auth/login` แทนที่จะเป็น `/api/auth/login`

### 3. Nuxt ไม่อ่านค่า PORT จาก Environment

- `nuxt.config.js` ไม่ได้กำหนดการอ่านค่า PORT และ HOST

---

## การแก้ไข

### ✅ 1. สร้างไฟล์ .env

สร้างไฟล์ `.env` จากการคัดลอก `env.example`:

```bash
cp env.example .env
```

**เนื้อหาในไฟล์ .env:**

```bash
# Server Port
PORT=3000
HOST=0.0.0.0

# Enable/Disable Cache
ENABLE_CACHE=false

# API Base URL
API_BASE_URL=http://localhost:3000/api

# App Configuration
APP_NAME=Riped V2 Admin
APP_VERSION=1.0.0
APP_DESCRIPTION=Admin Dashboard Template with Offline Support

# PWA Configuration
PWA_THEME_COLOR=#3551a4
PWA_BACKGROUND_COLOR=#ffffff
```

### ✅ 2. อัพเดท env.example

เพิ่ม PORT และ HOST configuration:

```bash
# Server Port
PORT=3000
HOST=0.0.0.0
```

### ✅ 3. แก้ไข nuxt.config.js

เพิ่มการตั้งค่า server:

```javascript
export default {
  ssr: false,
  mode: "spa",

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "0.0.0.0",
  },

  // ... rest of config

  axios: {
    baseURL: process.env.API_BASE_URL || "http://localhost:3000/api",
  },
};
```

### ✅ 4. แก้ไข api/index.js

ลบ prefix `/api` ออกจาก routes เพราะ Nuxt serverMiddleware จะ mount ที่ `/api` อยู่แล้ว:

**Before (ผิด):**

```javascript
app.post("/api/auth/login", ...)  // ❌ จะกลายเป็น /api/api/auth/login
app.get("/api/dashboard", ...)     // ❌ จะกลายเป็น /api/api/dashboard
```

**After (ถูก):**

```javascript
app.post("/auth/login", ...)  // ✅ จะเป็น /api/auth/login
app.get("/dashboard", ...)     // ✅ จะเป็น /api/dashboard
```

**API Routes ที่แก้ไขแล้ว:**

- `POST /auth/login` → เข้าถึงที่ `/api/auth/login`
- `POST /auth/logout` → เข้าถึงที่ `/api/auth/logout`
- `GET /auth/user` → เข้าถึงที่ `/api/auth/user`
- `GET /dashboard` → เข้าถึงที่ `/api/dashboard`
- `GET /dashboard/stats` → เข้าถึงที่ `/api/dashboard/stats`
- `GET /dashboard/orders` → เข้าถึงที่ `/api/dashboard/orders`
- `GET /dashboard/chart` → เข้าถึงที่ `/api/dashboard/chart`

---

## วิธีใช้งาน

### การรันโปรเจค

```bash
# Development mode
npm run dev

# จะรันที่ http://localhost:3000
```

### การเปลี่ยน Port

แก้ไขในไฟล์ `.env`:

```bash
# เปลี่ยนเป็น port อื่น เช่น 3001
PORT=3001
HOST=0.0.0.0

# อย่าลืมเปลี่ยน API_BASE_URL ด้วย
API_BASE_URL=http://localhost:3001/api
```

แล้วรันใหม่:

```bash
npm run dev
```

### การทดสอบ API

เปิดเบราว์เซอร์และไปที่:

1. **Test Dashboard API:**

   ```
   http://localhost:3000/api/dashboard
   ```

   ควรได้ JSON response:

   ```json
   {
     "stats": {
       "totalUsers": 1250,
       "totalOrders": 3420,
       "totalRevenue": 125000,
       "totalProducts": 89
     },
     "recentOrders": [...],
     "chartData": {...}
   }
   ```

2. **Test Login (ใช้ Postman หรือ curl):**

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

   ควรได้:

   ```json
   {
     "token": "mock-jwt-token-1",
     "user": {
       "id": 1,
       "username": "admin",
       "email": "admin@riper.com",
       "role": "admin",
       "name": "Administrator"
     }
   }
   ```

---

## การตรวจสอบว่าทำงานถูกต้อง

### 1. ตรวจสอบ Port

```bash
# ตรวจสอบว่า Nuxt รันที่ port ที่ตั้งไว้
lsof -i :3000
```

### 2. ตรวจสอบ API Endpoints

เปิด Browser DevTools (F12) → Network tab

แล้วลองเข้าสู่ระบบที่ `http://localhost:3000/login`

ควรเห็น request ไปที่:

- `http://localhost:3000/api/auth/login` ✅

ไม่ใช่:

- `http://localhost:3000/api/api/auth/login` ❌

### 3. ตรวจสอบ Console

ไม่ควรมี error เหล่านี้:

- ❌ `404 Not Found` จาก API endpoints
- ❌ `EADDRINUSE: address already in use` (port ซ้ำ)
- ❌ `Failed to load resource` จาก `/api/` routes

---

## การแก้ปัญหาเพิ่มเติม

### ปัญหา: Port already in use

```bash
# หยุดโปรเซสที่ใช้ port
lsof -ti:3000 | xargs kill -9

# หรือเปลี่ยน PORT ในไฟล์ .env
PORT=3001
```

### ปัญหา: API ไม่ตอบสนอง

1. ตรวจสอบว่า serverMiddleware ทำงาน:

   ```javascript
   // ใน nuxt.config.js
   serverMiddleware: ["~/api"],  // ✅ ต้องมี
   ```

2. ตรวจสอบว่าไม่มี prefix `/api` ซ้อน:

   ```javascript
   // ใน api/index.js
   app.post("/auth/login", ...)  // ✅ ถูกต้อง
   app.post("/api/auth/login", ...)  // ❌ ผิด (ซ้อน)
   ```

3. Restart server:
   ```bash
   # กด Ctrl+C แล้วรันใหม่
   npm run dev
   ```

### ปัญหา: Environment Variables ไม่ทำงาน

1. ตรวจสอบว่ามีไฟล์ `.env`:

   ```bash
   ls -la | grep .env
   ```

2. Restart server หลังแก้ไข .env:

   ```bash
   # ต้อง restart ทุกครั้งที่แก้ .env
   npm run dev
   ```

3. ตรวจสอบ syntax ในไฟล์ .env:

   ```bash
   # ถูกต้อง
   PORT=3000

   # ผิด (ไม่ต้องใช้เครื่องหมาย quotes)
   PORT="3000"
   ```

---

## สรุปการเปลี่ยนแปลง

### ไฟล์ที่แก้ไข:

1. ✅ **env.example** - เพิ่ม PORT และ HOST
2. ✅ **.env** - สร้างไฟล์ใหม่จาก env.example
3. ✅ **nuxt.config.js** - เพิ่ม server config และอ่านค่าจาก env
4. ✅ **api/index.js** - ลบ prefix `/api` ออกจาก routes

### ไฟล์ที่สร้างใหม่:

1. ✅ **SETUP.md** - คู่มือการตั้งค่าโปรเจค
2. ✅ **ENV_AND_API_FIX.md** - เอกสารนี้

### ผลลัพธ์:

- ✅ สามารถกำหนด PORT ผ่านไฟล์ .env ได้
- ✅ API endpoints ทำงานถูกต้อง
- ✅ Login ทำงานได้
- ✅ Dashboard แสดงข้อมูลได้
- ✅ ไม่มี routing errors

---

## การใช้งานต่อไป

### การพัฒนาต่อ:

```bash
# Run development
npm run dev

# Run with cache enabled
npm run dev:cache
```

### การ Deploy:

```bash
# Build for production
npm run build

# Start production server
npm start
```

### การตั้งค่าเพิ่มเติม:

ดูไฟล์:

- `SETUP.md` - คู่มือการตั้งค่า
- `IMPLEMENTATION_SUMMARY.md` - สรุปฟีเจอร์ทั้งหมด
- `VALIDATION_RULES.md` - กฎการ validate form

---

## ✅ เสร็จสมบูรณ์!

ตอนนี้โปรเจคพร้อมใช้งาน:

- ✅ มีไฟล์ .env สำหรับ config
- ✅ สามารถกำหนด PORT ได้
- ✅ API ทำงานถูกต้อง
- ✅ Login ใช้งานได้
- ✅ Dashboard แสดงผลได้

รันด้วย: `npm run dev`
เข้าใช้งานที่: `http://localhost:3000`
