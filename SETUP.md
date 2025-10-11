# Setup Guide - Riped V2

## การตั้งค่าเริ่มต้น

### 1. สร้างไฟล์ .env

คัดลอกไฟล์ `env.example` เป็น `.env`:

```bash
cp env.example .env
```

หรือสร้างไฟล์ `.env` ด้วยตัวเอง:

```bash
# Environment Configuration

# Server Port
PORT=3000
HOST=0.0.0.0

# Enable/Disable Cache (for development)
# Set to 'true' to enable PWA caching, 'false' to disable
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

### 2. การเปลี่ยน Port

หากต้องการเปลี่ยน port ให้แก้ไขในไฟล์ `.env`:

```bash
# เปลี่ยนเป็น port ที่ต้องการ
PORT=3001
HOST=0.0.0.0

# อย่าลืมเปลี่ยน API_BASE_URL ด้วย
API_BASE_URL=http://localhost:3001/api
```

### 3. ติดตั้ง Dependencies

```bash
npm install
```

### 4. รันโปรเจค

**Development Mode:**

```bash
npm run dev
```

**Development Mode with Cache:**

```bash
npm run dev:cache
```

**Production Build:**

```bash
npm run build
npm start
```

### 5. ตรวจสอบว่า API ทำงาน

เปิดเบราว์เซอร์และไปที่:

- Frontend: `http://localhost:3000`
- API Test (ถ้า port เป็น 3000): `http://localhost:3000/api/dashboard`

---

## API Endpoints

### Authentication

- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/user` - ดึงข้อมูลผู้ใช้

### Dashboard

- `GET /api/dashboard` - ข้อมูล dashboard ทั้งหมด
- `GET /api/dashboard/stats` - สถิติ
- `GET /api/dashboard/orders` - รายการคำสั่งซื้อ
- `GET /api/dashboard/chart` - ข้อมูล chart

---

## การแก้ปัญหา

### ปัญหา: API ไม่ทำงาน

**สาเหตุที่พบบ่อย:**

1. ไม่ได้สร้างไฟล์ `.env`
2. Port ในไฟล์ `.env` ซ้ำกับโปรแกรมอื่น
3. API_BASE_URL ไม่ตรงกับ PORT

**วิธีแก้:**

```bash
# 1. ตรวจสอบว่ามีไฟล์ .env
ls -la | grep .env

# 2. ถ้าไม่มี ให้คัดลอกจาก env.example
cp env.example .env

# 3. ตรวจสอบ PORT ว่าใช้งานได้
lsof -i :3000

# 4. เปลี่ยน PORT ถ้าจำเป็น
# แก้ไขในไฟล์ .env
```

### ปัญหา: Login ไม่ได้

**สาเหตุ:**

- API endpoint ไม่ถูกต้อง
- CORS issue

**วิธีแก้:**

1. ตรวจสอบว่า API ทำงาน: เปิด `http://localhost:3000/api/dashboard`
2. ตรวจสอบ Console ใน Browser DevTools
3. ลองใช้ข้อมูล demo:
   - Username: `admin` / Password: `admin123`
   - Username: `user` / Password: `user123`

### ปัญหา: Module not found

**วิธีแก้:**

```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules
npm install

# หรือ
rm -rf node_modules package-lock.json
npm install
```

### ปัญหา: Port already in use

**วิธีแก้:**

```bash
# Option 1: หยุดโปรแกรมที่ใช้ port นั้นอยู่
lsof -ti:3000 | xargs kill -9

# Option 2: เปลี่ยน PORT ในไฟล์ .env
# แก้ไข PORT=3001 แทน
```

---

## การใช้งาน Environment Variables

### ในไฟล์ .env

```bash
# กำหนดค่าได้โดยตรง
PORT=3000
API_BASE_URL=http://localhost:3000/api
```

### ในโค้ด (nuxt.config.js)

```javascript
// เข้าถึงผ่าน process.env
server: {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0'
}
```

### ในไฟล์ Vue/JS

```javascript
// เข้าถึงผ่าน process.env
const apiUrl = process.env.API_BASE_URL;
```

---

## คำสั่งที่ใช้บ่อย

```bash
# รัน development
npm run dev

# รัน development with cache enabled
npm run dev:cache

# Build สำหรับ production
npm run build

# รัน production
npm start

# Generate static files
npm run generate

# Generate with cache
npm run generate:cache

# ล้าง cache
rm -rf .nuxt

# ล้าง cache และ node_modules
rm -rf .nuxt node_modules package-lock.json && npm install
```

---

## ข้อมูลเพิ่มเติม

- **Framework**: Nuxt 2
- **Default Port**: 3000
- **API Path**: `/api/*`
- **Auth System**: @nuxtjs/auth with offline support
- **Database**: IndexedDB (browser storage)

---

## ติดต่อและรายงานปัญหา

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ Console log ใน Browser
2. ตรวจสอบ Terminal output
3. อ่าน IMPLEMENTATION_SUMMARY.md และ VALIDATION_RULES.md
