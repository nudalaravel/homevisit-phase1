# Riped V2 Admin - PWA

ระบบจัดการแอดมินที่ทำงานแบบ Offline เป็นหลัก พร้อมการ Sync กับ Server และรองรับ PWA (Progressive Web App) เต็มรูปแบบ

## ฟีเจอร์หลัก

### 🌐 PWA (Progressive Web App)

- **ทำงานออฟไลน์ได้สมบูรณ์**: ใช้งานได้แม้ไม่มีอินเทอร์เน็ต
- **ติดตั้งได้**: ติดตั้งเป็นแอปบนมือถือและเดสก์ท็อป
- **Service Worker**: จัดการ cache และ background sync
- **Responsive Design**: ใช้งานได้ทุกขนาดหน้าจอ

### 🔐 ระบบ Authentication แบบออฟไลน์

- **ล็อคอินออฟไลน์**: เข้าสู่ระบบได้แม้ไม่มีเน็ต (ถ้าเคยล็อคอินมาก่อน)
- **จดจำ 1 ปี**: Token เก็บไว้ได้ 1 ปี
- **Logout ได้**: ออกจากระบบได้แม้ออฟไลน์
- **ป้องกัน Login ออฟไลน์**: ห้ามล็อคอินใหม่ถ้าไม่มีเน็ต

### 📡 ระบบ Sync ข้อมูล

- **Queue System**: เก็บข้อมูลที่แก้ไขไว้รอซิงค์
- **Auto Sync**: ซิงค์อัตโนมัติเมื่อกลับมาออนไลน์
- **Manual Sync**: ซิงค์ด้วยตนเองได้
- **Status Indicator**: แสดงสถานะการซิงค์

### 🎨 ธีมและ UI

- **ธีมสี #3551a4**: สีหลักตามที่กำหนด
- **Logo Support**: รองรับ logo จาก assets/images/logo.png
- **Modern UI**: ดีไซน์ทันสมัยด้วย Bootstrap Vue
- **Thai Language**: ภาษาไทยเต็มรูปแบบ

### ⚙️ การตั้งค่า Cache

- **Development Mode**: ปิด cache ไว้เป็น default
- **Production Mode**: เปิด cache ได้ด้วย ENABLE_CACHE=true
- **Configurable**: ตั้งค่าได้ผ่าน environment variables

## Tech Stack

- **Frontend**: Nuxt.js 2, Vue.js 2, Bootstrap Vue
- **PWA**: @nuxtjs/pwa, Workbox
- **Offline**: Service Worker, IndexedDB, localStorage
- **Styling**: CSS3, Bootstrap 4, Custom Theme
- **Charts**: Chart.js, Vue Chart.js
- **Icons**: Font Awesome 5

## การติดตั้งและใช้งาน

### Prerequisites

- Node.js (v14 หรือสูงกว่า)
- npm หรือ yarn

### การติดตั้ง

1. Clone repository:

```bash
git clone <repository-url>
cd ripped-v2
```

2. ติดตั้ง dependencies:

```bash
npm install
# หรือ
yarn install
```

3. ตั้งค่า environment (ไม่บังคับ):

```bash
cp env.example .env
# แก้ไข .env ตามต้องการ
```

4. เริ่ม development server:

```bash
npm run dev
# หรือ
yarn dev
```

5. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### การตั้งค่า Cache

#### Development (Default)

```bash
# Cache ปิดอยู่ (default)
ENABLE_CACHE=false
```

#### Production

```bash
# เปิด cache สำหรับ production
ENABLE_CACHE=true
NODE_ENV=production
```

### Demo Credentials

- **Admin**: admin / admin123
- **User**: user / user123

## โครงสร้างโปรเจค

```
├── api/                    # API routes และ mock data
├── assets/                 # Static assets (CSS, images, logo)
│   ├── css/main.css       # ธีมสี #3551a4
│   └── images/logo.png    # Logo หลัก
├── components/             # Vue components
│   └── OnlineStatus.vue   # แสดงสถานะออนไลน์/ออฟไลน์
├── layouts/                # Layout components
│   ├── admin.vue          # Layout หลักพร้อม sidebar
│   └── default.vue        # Layout พื้นฐาน
├── middleware/             # Route middleware
│   └── auth.js            # Authentication middleware
├── pages/                  # Application pages
│   ├── login.vue          # หน้าล็อคอิน (รองรับออฟไลน์)
│   ├── offline.vue        # หน้าแสดงเมื่อออฟไลน์
│   └── ...                # หน้าอื่นๆ
├── plugins/                # Nuxt plugins
│   ├── offline.js         # จัดการ offline/sync
│   └── auth-offline.js    # Authentication แบบออฟไลน์
├── static/                 # Static files
│   ├── sw.js              # Service Worker
│   ├── icon-192x192.png   # PWA icon
│   └── icon-512x512.png   # PWA icon
├── store/                  # Vuex store
│   └── index.js           # State management
└── nuxt.config.js         # Nuxt configuration + PWA
```

## การใช้งาน

### การทำงานออฟไลน์

1. **ล็อคอินครั้งแรก**: ต้องมีอินเทอร์เน็ต
2. **ใช้งานออฟไลน์**: ใช้งานได้ปกติหลังล็อคอินแล้ว
3. **แก้ไขข้อมูล**: ข้อมูลจะถูกเก็บใน queue รอซิงค์
4. **กลับมาออนไลน์**: ระบบจะซิงค์อัตโนมัติ

### การซิงค์ข้อมูล

```javascript
// เพิ่มข้อมูลลง sync queue
this.$offline.addToSyncQueue("CREATE_ORDER", orderData);

// ซิงค์ด้วยตนเอง
await this.$store.dispatch("syncData");

// ตรวจสอบสถานะ
const status = this.$store.getters.syncStatus;
```

### การตรวจสอบสถานะ

```javascript
// ตรวจสอบว่าออนไลน์หรือไม่
const isOnline = this.$store.state.isOnline;

// ตรวจสอบว่ามีข้อมูลรอซิงค์หรือไม่
const hasPendingSync = this.$store.getters.hasPendingSync;

// ตรวจสอบสถานะการซิงค์
const syncStatus = this.$store.getters.syncStatus;
```

## การปรับแต่ง

### เปลี่ยนธีมสี

แก้ไขใน `assets/css/main.css`:

```css
.btn-primary {
  background-color: #3551a4; /* สีหลัก */
  border-color: #3551a4;
}
```

### เปลี่ยน Logo

วางไฟล์ logo ใน `assets/images/logo.png` (แนะนำขนาด 40x40px)

### เพิ่มฟีเจอร์ซิงค์

แก้ไขใน `plugins/offline.js`:

```javascript
// เพิ่ม action ใหม่ใน syncItem method
case 'YOUR_ACTION':
  return await app.$axios.post('/your-endpoint', data)
```

## การ Deploy

### Development

```bash
npm run dev
```

### Production

```bash
# เปิด cache
export ENABLE_CACHE=true
export NODE_ENV=production

# Build
npm run build

# Start
npm run start
```

### Static Generation

```bash
npm run generate
```

## การแก้ไขปัญหา

### Cache ไม่ทำงาน

- ตรวจสอบ `ENABLE_CACHE=true`
- ตรวจสอบ `NODE_ENV=production`
- ล้าง cache ของเบราว์เซอร์

### ล็อคอินออฟไลน์ไม่ได้

- ตรวจสอบว่าล็อคอินออนไลน์มาก่อน
- ตรวจสอบ localStorage มี token หรือไม่
- ตรวจสอบ token ยังไม่หมดอายุ (1 ปี)

### ข้อมูลไม่ซิงค์

- ตรวจสอบสถานะออนไลน์
- ตรวจสอบ sync queue ใน localStorage
- ดู console log สำหรับ error

## License

MIT License
