# การตรวจสอบและลบ Fake IndexedDB

## สรุปการเปลี่ยนแปลง

เอกสารนี้สรุปการตรวจสอบและลบ fake IndexedDB ออกจากระบบ เพื่อใช้งาน IndexedDB จริงเท่านั้น

## การเปลี่ยนแปลงที่ทำ

### 1. ลบ Plugin Fake IndexedDB

- ✅ ลบไฟล์ `plugins/fake-indexeddb.js`
- ✅ ลบการอ้างอิงใน `nuxt.config.js` (บรรทัดที่ 48)
- ✅ ลบไฟล์ทดสอบ `test-fake-indexeddb.html`

### 2. อัพเดท IndexedDB Plugin

- ✅ แก้ไข `plugins/indexeddb.js` เพื่อลบข้อความเตือนเกี่ยวกับ fake IndexedDB
- ✅ เปลี่ยนข้อความแจ้งเตือนเมื่อ IndexedDB ไม่พร้อมใช้งานให้ชัดเจนขึ้น

### 3. ทำความสะอาดโฟลเดอร์ Build

- ✅ ลบโฟลเดอร์ `.nuxt` เพื่อเคลียร์แคชที่อ้างอิง fake-indexeddb

## ไฟล์ที่ใช้งาน IndexedDB (ตรวจสอบแล้ว)

### 1. Core Plugin

- `plugins/indexeddb.js` - IndexedDB Manager หลัก
  - ใช้ native IndexedDB API เท่านั้น
  - มีการตรวจสอบว่า IndexedDB พร้อมใช้งานหรือไม่
  - จัดการ Database เวอร์ชัน 3 พร้อม Object Stores:
    - users
    - orders
    - products
    - settings
    - syncQueue
    - patients
    - images
    - surveys

### 2. Plugins ที่เกี่ยวข้อง

- `plugins/offline.js` - Offline Manager
  - ใช้ `$indexedDB` เป็น fallback option
  - มี localStorage เป็นทางเลือกสำรอง

### 3. Components

- `components/StorageStatus.vue` - แสดงสถานะการจัดเก็บข้อมูล

  - ตรวจสอบว่า IndexedDB พร้อมใช้งาน
  - แสดง Storage Quota และสถิติ
  - มีฟังก์ชัน Sync และ Clear Data

- `components/OnlineStatus.vue` - แสดงสถานะออนไลน์/ออฟไลน์
  - ตรวจสอบ Sync Queue จาก IndexedDB
  - แสดงจำนวนรายการรอซิงค์

### 4. Pages

- `pages/survey.vue` - หน้าแบบสอบถาม
  - บันทึกรูปภาพลง IndexedDB (images store)
  - บันทึกข้อมูล Survey (surveys store)
  - มีการจัดการ fallback หาก IndexedDB ไม่พร้อม

## การทำงานของ IndexedDB ในระบบ

### Database Schema

```
Database: RipedV2DB (Version 3)

Object Stores:
1. users - keyPath: id, Index: email (unique), role
2. orders - keyPath: id, Index: customer, status, date
3. products - keyPath: id, Index: name, category, price
4. settings - keyPath: key
5. syncQueue - keyPath: id (auto), Index: action, timestamp
6. patients - keyPath: id (auto), Index: name, nickname, appointmentDate
7. images - keyPath: id, Index: timestamp
8. surveys - keyPath: id, Index: timestamp
```

### การตรวจสอบว่า IndexedDB พร้อมใช้งาน

```javascript
if (
  typeof window === "undefined" ||
  !window.indexedDB ||
  typeof window.indexedDB.open !== "function"
) {
  console.error("IndexedDB is not available in this browser");
  return null;
}
```

**หมายเหตุ:** ใช้ `window.indexedDB` แทน `indexedDB` เพื่อให้แน่ใจว่าอ้างอิงถึง global object ที่ถูกต้อง

### การใช้งานใน Component

```javascript
// ตรวจสอบว่ามี IndexedDB
if (this.$indexedDB) {
  await this.$indexedDB.saveSurvey(data);
}
```

## Browser Support

IndexedDB รองรับโดย:

- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ iOS Safari 10+
- ✅ Chrome for Android

## วิธีทดสอบ

### 1. เปิด Browser Developer Tools

```
F12 → Application → Storage → IndexedDB
```

### 2. ตรวจสอบ Database

ควรเห็น `RipedV2DB` พร้อม Object Stores ทั้งหมด

### 3. ทดสอบบันทึกข้อมูล

- เข้าหน้า Survey และกรอกแบบสอบถาม
- ตรวจสอบว่าข้อมูลบันทึกใน `surveys` store
- ถ่ายรูป/อัพโหลดรูป ตรวจสอบใน `images` store

### 4. ทดสอบ Offline Mode

- ปิดเน็ต (Chrome DevTools → Network → Offline)
- ทำรายการต่างๆ
- ตรวจสอบ `syncQueue` store ว่ามีข้อมูลรอซิงค์
- เปิดเน็ต ดูว่าซิงค์อัตโนมัติได้ไหม

## ไฟล์ที่เหลือ (ไม่ได้ลบ)

- `test-indexeddb.html` - ไฟล์ทดสอบ IndexedDB จริง (เก็บไว้เพื่อการทดสอบ)

## ขั้นตอนต่อไป

1. ✅ Run development server เพื่อทดสอบ:

```bash
npm run dev
```

2. ✅ ทดสอบการใช้งานใน Browser ที่รองรับ IndexedDB

3. ✅ ตรวจสอบ Console ว่าไม่มี Error เกี่ยวกับ IndexedDB

4. ⚠️ หาก Deploy บน HTTPS แล้วจึงจะใช้งาน Service Worker และ IndexedDB เต็มประสิทธิภาพ

## หมายเหตุ

- ระบบใช้ **native IndexedDB API เท่านั้น** ไม่มี fake/mock implementation
- มี **fallback ไป localStorage** ในบางกรณีที่ IndexedDB ไม่พร้อม
- **Offline Support** ทำงานผ่าน IndexedDB sync queue
- ข้อมูลถูกเก็บ **บน client-side** เท่านั้น ปลอดภัยสำหรับ offline usage
