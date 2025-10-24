# สรุปการทำงาน: Bookings Sync System

## ✅ งานที่เสร็จสมบูรณ์

### 1. ✅ IndexedDB Schema (`plugins/indexeddb.js`)

**สิ่งที่ทำ:**

- อัปเกรด database version จาก 5 เป็น 6
- สร้าง `bookings` object store ใหม่
  - Primary key: `stid`
  - Indexes: `dataSource`, `lastSyncedAt`
- เพิ่ม CRUD methods จำนวน 8 ตัว:
  - `addBooking()` - เพิ่มหรืออัปเดทการนัดหมาย
  - `addBookings()` - เพิ่มหลายรายการ
  - `getBookings()` - ดึงทั้งหมด
  - `getBooking(stid)` - ดึงตาม stid
  - `updateBooking()` - อัปเดทการนัดหมาย
  - `deleteBooking()` - ลบการนัดหมาย
  - `clearBookings()` - ล้างทั้งหมด
  - `getUnsyncedBookings()` - ดึงที่แก้ไขออฟไลน์

**ไฟล์:** `/Users/exd/Documents/works/riped-v2/plugins/indexeddb.js`

---

### 2. ✅ Sync System (`plugins/system-init.js`)

**สิ่งที่ทำ:**

- สร้าง `syncBookings(username)` method
  - ดึงข้อมูลจาก API: `GET /api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}`
  - Merge กับข้อมูลในเครื่อง (รักษาการแก้ไขออฟไลน์)
  - บันทึกลง IndexedDB พร้อม `dataSource` tracking
- สร้าง `pushBookingsToAPI()` method
  - หาการนัดหมายที่มี `dataSource: "local"`
  - ส่งกลับไป API: `PUT /api/parenting2025_census/put/homevisit/putdata_arr.php`
  - ใช้ payload format ตามที่ระบุ
  - อัปเดทเป็น `dataSource: "api"` เมื่อสำเร็จ

**ไฟล์:** `/Users/exd/Documents/works/riped-v2/plugins/system-init.js`

---

### 3. ✅ Dashboard Integration (`pages/index.vue`)

**สิ่งที่ทำ:**

#### 3.1 `loadVisitors()` method

- โหลด bookings จาก IndexedDB
- สร้าง Map สำหรับ join ด้วย `stid`
- ผนวกข้อมูล `appointmentDate` และ `appointmentTime` เข้ากับ visitors

#### 3.2 `saveAppointment()` method

- แปลงปีไทยเป็นปี ค.ศ. สำหรับเก็บข้อมูล
- บันทึกลง bookings table ด้วย `dataSource: "local"`
- อัปเดทการแสดงผลทันที
- เรียก background sync ถ้า online

#### 3.3 `scheduleAppointment()` method

- ตรวจสอบว่ามีนัดหมายอยู่แล้วหรือไม่
- ถ้ามี → แสดงวันที่เดิม (แปลงเป็นปีไทย)
- ถ้าไม่มี → ใช้วันปัจจุบัน

#### 3.4 `initializeSystem()` method

- เพิ่ม `syncBookings()` ในขั้นตอนการเริ่มต้น
- เพิ่ม `pushBookingsToAPI()` สำหรับส่งข้อมูลที่รอ sync

#### 3.5 `handleOnlineStatusChange()` method

- เพิ่ม auto-sync เมื่อกลับมา online
- Push booking changes ก่อน → ดึงข้อมูลล่าสุด → Reload visitors

**ไฟล์:** `/Users/exd/Documents/works/riped-v2/pages/index.vue`

---

## 🔄 Data Flow ที่สมบูรณ์

### Scenario 1: เปิดแอปครั้งแรก (Online)

```
1. User เปิดแอป
2. initializeSystem() เริ่มทำงาน
3. syncVisitors() → ดึงข้อมูลผู้รับบริการ
4. syncBookings() → ดึงข้อมูลนัดหมาย
5. pushBookingsToAPI() → ส่งการแก้ไขที่ค้างอยู่ (ถ้ามี)
6. loadVisitors() → Join bookings กับ visitors
7. แสดงผลใน UI
```

### Scenario 2: สร้าง/แก้ไขนัดหมาย (Online)

```
1. User กดปุ่มนัดหมาย
2. scheduleAppointment() → เปิด modal (แสดงข้อมูลเดิมถ้ามี)
3. User แก้ไขและบันทึก
4. saveAppointment() → บันทึกลง bookings (dataSource: "local")
5. อัปเดท visitor display ทันที
6. pushBookingsToAPI() → ส่งไป API ทันที (background)
7. API success → อัปเดทเป็น dataSource: "api"
```

### Scenario 3: แก้ไขนัดหมายตอน Offline

```
1. User offline
2. User แก้ไขนัดหมาย
3. saveAppointment() → บันทึกลง bookings (dataSource: "local")
4. อัปเดท display ใน memory
5. [รอ online]
6. User กลับมา online
7. handleOnlineStatusChange() ทำงาน
8. pushBookingsToAPI() → ส่งการแก้ไขไป API
9. syncBookings() → ดึงข้อมูลล่าสุด
10. loadVisitors() → Reload ด้วยข้อมูลใหม่
```

---

## 📊 Database Schema

### Bookings Table

```javascript
{
  stid: "900601010105",           // Primary Key
  appointmentDate: "2025-10-20",  // ISO format (YYYY-MM-DD)
  appointmentTime: "16:00 น.",   // Time with Thai label
  dataSource: "api" | "local",    // Sync status
  lastSyncedAt: "2025-10-18T..."  // ISO timestamp
}
```

---

## 🔌 API Integration

### GET Bookings (ดึงวันนัดหมาย)

**Endpoint:** `GET /api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}`

**คำอธิบาย:**

- เป็น endpoint เฉพาะสำหรับ**ดึงเฉพาะข้อมูลวันนัดหมาย**
- ใช้ `stid` เป็น key หลักในการจับคู่
- แยกจาก `getchildsample.php` (ของเดิมไม่ต้องแก้ไข)

**Expected Response:**

```json
{
  "results": [
    {
      "stid": "900601010105",
      "appointmentDate": "2025-10-20",
      "appointmentTime": "16:00 น."
    }
  ]
}
```

**Validation & Error Handling:**

- ✅ ตรวจสอบ `stid` ต้องมีค่า (required)
- ✅ ข้าม record ที่ไม่มีข้อมูลนัดหมาย
- ✅ Log sample data สำหรับ debug
- ✅ แสดง HTTP error status ถ้ามีปัญหา

### PUT Bookings (Sync back)

**Endpoint:** `PUT /api/parenting2025_census/put/homevisit/putdata_arr.php`

**Payload:**

```json
{
  "variable": [["appointmentDate", "appointmentTime"]],
  "value": [["2025-10-20", "16:00 น."]],
  "pk": [["stid"]],
  "pkval": [["900601010105"]],
  "tb": "homevisitor_sample_students"
}
```

---

## ✨ Features ที่ได้

### ✅ Offline-First

- บันทึกการนัดหมายได้แม้ออฟไลน์
- ข้อมูลเก็บใน IndexedDB
- Sync อัตโนมัติเมื่อกลับมา online

### ✅ Automatic Sync

- เริ่มต้นแอป → ดึงข้อมูลล่าสุด
- บันทึกนัดหมาย → ส่งทันที (ถ้า online)
- กลับมา online → sync ทันที

### ✅ Conflict Resolution

- การแก้ไขออฟไลน์ไม่ถูก overwrite
- Push ก่อน Pull เพื่อส่งการแก้ไขให้เสร็จก่อน
- Track ด้วย `dataSource` field

### ✅ Data Integrity

- แยก table bookings จาก visitors
- Join แบบ left join ไม่ซ้ำซ้อน
- Track sync timestamp

### ✅ User Experience

- แสดงนัดหมายในรายการผู้รับบริการ
- แก้ไขได้ตลอดเวลา
- Pre-fill ข้อมูลเดิมตอนแก้ไข
- รองรับปีไทย (พ.ศ.) ในการแสดงผล

---

## 📝 Files Changed

1. **plugins/indexeddb.js** - เพิ่ม bookings table และ CRUD operations
2. **plugins/system-init.js** - เพิ่ม sync methods สำหรับ bookings
3. **pages/index.vue** - ผนวกการแสดงผลและแก้ไขนัดหมาย
4. **BOOKINGS_SYNC_IMPLEMENTATION.md** - Documentation ฉบับเต็ม

---

## 🧪 Testing Guide

### Test Case 1: สร้างนัดหมายใหม่ (Online)

1. เปิดแอปในสถานะ online
2. คลิกที่คอลัมน์ "วันนัดหมาย" ของผู้รับบริการ
3. เลือกวันที่และเวลา
4. บันทึก
5. ✅ ควรแสดงวันนัดหมายทันที
6. ✅ เช็ค console ควรเห็น "✅ Synced booking for stid: xxx"

### Test Case 2: แก้ไขนัดหมาย (Online)

1. คลิกที่ผู้รับบริการที่มีนัดหมายแล้ว
2. ✅ Modal ควร pre-fill วันที่เดิม
3. แก้ไขวันที่หรือเวลา
4. บันทึก
5. ✅ ควรอัปเดทการแสดงผลทันที

### Test Case 3: สร้างนัดหมาย Offline

1. ปิด internet หรือเปิดโหมด Airplane
2. สร้างหรือแก้ไขนัดหมาย
3. ✅ ควรบันทึกได้และแสดงผล
4. เปิด internet กลับ
5. ✅ รอ 2 วินาที ควรเห็น log "✅ Bookings synced after coming online"

### Test Case 4: ตรวจสอบ IndexedDB

1. เปิด Chrome DevTools → Application → IndexedDB → RipedV2DB
2. ✅ ควรเห็น table "bookings"
3. ✅ ข้อมูลใน bookings ควรมี stid, appointmentDate, appointmentTime, dataSource

---

## 🎯 สรุปความสำเร็จ

✅ **ครบถ้วนตาม Requirements:**

- [x] ดึงวันนัดหมายจาก API
- [x] Sync ลง table bookings
- [x] แสดงผลใน visitors ที่ตัวแปร appointmentDate
- [x] รองรับ offline edit และ sync กลับ
- [x] ใช้ flow เดียวกับ visitors sync

✅ **คุณภาพโค้ด:**

- [x] ไม่มี linter errors
- [x] มี documentation ครบถ้วน
- [x] มี error handling
- [x] มี console logs สำหรับ debug

✅ **User Experience:**

- [x] ทำงานได้ทั้ง online และ offline
- [x] Sync อัตโนมัติ
- [x] แสดงผลทันที
- [x] Pre-fill ข้อมูลเดิม

---

## 🚀 พร้อมใช้งาน

ระบบ Bookings Sync System พร้อมใช้งานแล้ว! ผู้ใช้สามารถ:

- ✅ ดูวันนัดหมายของผู้รับบริการ
- ✅ สร้างและแก้ไขนัดหมายได้ตลอดเวลา
- ✅ ทำงานได้แม้ออฟไลน์
- ✅ Sync อัตโนมัติเมื่อกลับมา online

**วันที่เสร็จสมบูรณ์:** 18 ตุลาคม 2568
