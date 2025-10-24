# Bookings Sync Flow - Final Implementation

## วันที่: 18 ตุลาคม 2568

## การทำงานสมบูรณ์

### 🔄 Flow การ Sync ทั้งหมด

#### 1. เมื่อกดปุ่ม Sync (Manual Sync)

**ที่:** Layout `admin.vue` → ปุ่ม Sync

**Flow:**

```
User กดปุ่ม Sync
    ↓
admin.vue → handleSync()
    ↓
$store.dispatch('manualSync', this)
    ↓
store/index.js → manualSync action:
    │
    ├─ 1. pushBookingsToAPI()
    │     └─ ส่งการแก้ไข bookings ที่รอ sync (dataSource: "local")
    │
    ├─ 2. syncVisitors(username)
    │     └─ GET /api/.../getchildsample.php?homevisitor=${username}
    │     └─ บันทึกลง IndexedDB table: visitors
    │
    ├─ 3. syncBookings(username) ✅ เพิ่มใหม่
    │     └─ GET /api/.../getchildsample_app.php?homevisitor=${username}
    │     └─ บันทึกลง IndexedDB table: bookings
    │
    └─ 4. updateActivitiesFromAPI()
          └─ GET /api/.../getobjective.php
          └─ บันทึกลง IndexedDB table: activities
    ↓
$nuxt.$emit('sync-completed')
    ↓
index.vue → handleSyncCompleted()
    ↓
loadVisitors()
    ├─ โหลด visitors จาก IndexedDB
    ├─ โหลด bookings จาก IndexedDB
    ├─ Join bookings กับ visitors โดยใช้ stid
    └─ แสดงผลพร้อม appointmentDate
    ↓
UI อัปเดตพร้อมข้อมูลล่าสุด
```

---

#### 2. เมื่อเปิดแอป (Auto Sync)

**ที่:** `pages/index.vue` → `initializeSystem()`

**Flow:**

```
User เปิดแอป
    ↓
mounted() → initializeSystem()
    ↓
$store.dispatch('initializeSystem')
    └─ $systemInit.initialize()
    ↓
ถ้า online และมี username:
    │
    ├─ 1. syncVisitors(username)
    ├─ 2. syncBookings(username)
    └─ 3. pushBookingsToAPI()
    ↓
loadVisitors()
    └─ Join และแสดงผล
```

---

#### 3. เมื่อกลับมา Online (Reconnect Sync)

**ที่:** `pages/index.vue` → `handleOnlineStatusChange()`

**Flow:**

```
Device กลับมา online
    ↓
window.addEventListener('online') trigger
    ↓
handleOnlineStatusChange()
    ↓
setTimeout (debounce 2 วินาที)
    │
    ├─ 1. processSyncQueue()
    │     └─ Sync visitor changes ที่แก้ไขตอน offline
    │
    ├─ 2. pushBookingsToAPI()
    │     └─ Sync booking changes ที่แก้ไขตอน offline
    │
    ├─ 3. syncBookings(username)
    │     └─ ดึงข้อมูลล่าสุดจาก API
    │
    └─ 4. loadVisitors()
          └─ Reload และแสดงผล
```

---

#### 4. เมื่อแก้ไขนัดหมาย

**ที่:** `pages/index.vue` → `saveAppointment()`

**Flow:**

```
User แก้ไขนัดหมาย → กดบันทึก
    ↓
saveAppointment()
    ├─ บันทึกลง bookings (dataSource: "local")
    ├─ อัปเดท visitor display ทันที
    │
    └─ ถ้า online:
          └─ pushBookingsToAPI() (background)
                └─ PUT /api/.../putdata_arr.php
                └─ อัปเดท dataSource: "api" เมื่อสำเร็จ
```

---

## 📋 API Endpoints ที่ใช้

### 1. Visitors (ผู้รับบริการ)

```
GET /api/parenting2025_census/get/homevisit/getchildsample.php?homevisitor=${username}
```

- ใช้ใน: `syncVisitors()`
- ดึงข้อมูล: ผู้รับบริการทั้งหมด
- เก็บใน: IndexedDB table `visitors`

### 2. Bookings (วันนัดหมาย) ✅

```
GET /api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}
```

- ใช้ใน: `syncBookings()`
- ดึงข้อมูล: **เฉพาะวันนัดหมาย** โดยใช้ `stid` เป็น key
- เก็บใน: IndexedDB table `bookings`
- Response: `{ results: [{ stid, appointmentDate, appointmentTime }] }`

### 3. Push Bookings Changes

```
PUT /api/parenting2025_census/put/homevisit/putdata_arr.php
```

- ใช้ใน: `pushBookingsToAPI()`
- ส่งข้อมูล: การแก้ไข bookings ที่มี `dataSource: "local"`
- Payload:

```json
{
  "variable": [["appointmentDate", "appointmentTime"]],
  "value": [["2025-10-20", "16:00 น."]],
  "pk": [["stid"]],
  "pkval": [["900601010105"]],
  "tb": "homevisitor_sample_students"
}
```

### 4. Activities (กิจกรรม)

```
GET /api/parenting2025_census/get/homevisit/getobjective.php
```

- ใช้ใน: `updateActivitiesFromAPI()`
- ดึงข้อมูล: กิจกรรมทั้งหมด
- เก็บใน: IndexedDB table `activities`

---

## 🗂️ ไฟล์ที่แก้ไข

### 1. `/store/index.js` ✅ แก้ไขใหม่

**เพิ่ม bookings sync ใน `manualSync` action:**

```javascript
// ส่งการแก้ไข bookings ที่รอ sync ก่อน
await app.$systemInit.pushBookingsToAPI();

// ซิงค์ผู้รับบริการ (getchildsample.php)
const visitorsSuccess = await app.$systemInit.syncVisitors(username);

// ซิงค์ข้อมูลวันนัดหมาย (getchildsample_app.php) ✅ เพิ่มใหม่
const bookingsSuccess = await app.$systemInit.syncBookings(username);
```

### 2. `/plugins/system-init.js`

**Methods:**

- `syncBookings(username)` - ดึงข้อมูลจาก API และบันทึก
- `pushBookingsToAPI()` - ส่งการแก้ไขกลับไป API

### 3. `/plugins/indexeddb.js`

**Database version 6:**

- เพิ่ม `bookings` object store
- เพิ่ม CRUD methods สำหรับ bookings

### 4. `/pages/index.vue`

**Methods:**

- `loadVisitors()` - Join bookings กับ visitors
- `saveAppointment()` - บันทึกการนัดหมาย
- `handleSyncCompleted()` - Reload เมื่อ sync เสร็จ
- `handleOnlineStatusChange()` - Sync เมื่อกลับมา online

---

## ✅ การทำงานที่ครบถ้วน

### Sync Points (จุดที่ sync ทำงาน)

1. ✅ **Manual Sync** - กดปุ่ม Sync ใน admin.vue
   - `getchildsample.php` และ `getchildsample_app.php` ทำงานพร้อมกัน
2. ✅ **Auto Sync on Start** - เปิดแอปครั้งแรก
   - ดึงข้อมูลทั้งหมดจาก API
3. ✅ **Reconnect Sync** - กลับมา online

   - Push changes → Fetch latest → Reload

4. ✅ **Immediate Push** - แก้ไขนัดหมายตอน online
   - บันทึกและ push ทันที

### Data Flow

```
API (Server)
    ↓ sync
IndexedDB (Local Storage)
    ├─ visitors table
    ├─ bookings table (join by stid)
    └─ activities table
    ↓ load
UI Display (Dashboard)
    └─ visitors with appointmentDate
```

---

## 🧪 การทดสอบ

### Test Case 1: Manual Sync

1. เปิดแอป
2. กดปุ่ม Sync (admin layout)
3. ✅ ควรเห็น log:
   ```
   🔄 Syncing visitors for username...
   🔄 Syncing bookings for username...
   ✅ Bookings sync completed: X new, Y updated, Z skipped
   ```
4. ✅ Dashboard แสดงวันนัดหมายอัปเดต

### Test Case 2: Auto Sync on Start

1. ปิดและเปิดแอปใหม่
2. ✅ Loading screen แสดง "กำลังซิงค์ข้อมูลการนัดหมาย..."
3. ✅ Dashboard แสดงข้อมูลล่าสุด

### Test Case 3: Offline Edit → Online Sync

1. ปิด internet
2. แก้ไขนัดหมาย
3. เปิด internet
4. ✅ รอ 2 วินาที → auto sync
5. ✅ ข้อมูลถูกส่งไป API

### Test Case 4: Online Edit

1. แก้ไขนัดหมายตอน online
2. ✅ บันทึกทันที
3. ✅ Push ไป API ใน background
4. ✅ แสดงผลทันที

---

## 📝 สรุป

**ระบบ Bookings Sync ทำงานครบถ้วนแล้ว:**

✅ `getchildsample_app.php` ถูกเรียกพร้อมกับ `getchildsample.php` เมื่อกด Sync  
✅ ดึงเฉพาะข้อมูลวันนัดหมาย โดยใช้ `stid` เป็น key  
✅ Sync ทุกจุด: Manual Sync, Auto Sync, Reconnect Sync  
✅ Push offline changes กลับไป API  
✅ Join และแสดงผลถูกต้อง  
✅ ไม่แก้ไขของเดิม (getchildsample.php)  
✅ ไม่มี linter errors

**พร้อมใช้งาน!** 🚀
