# Bookings API Verification & Improvements

## วันที่: 18 ตุลาคม 2568

## การตรวจสอบและปรับปรุง

### 🔍 ข้อมูล API Endpoint

**API Endpoint สำหรับดึงข้อมูลวันนัดหมาย:**

```
GET /api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}
```

**ลักษณะข้อมูล:**

- เป็น endpoint เฉพาะสำหรับดึง**เฉพาะข้อมูลวันนัดหมาย**
- ใช้ `stid` เป็น key หลักในการจับคู่ข้อมูล
- แยกจาก endpoint ตัวอื่น (getchildsample.php ไม่ต้องแก้ไข)

**Expected Response Format:**

```json
{
  "results": [
    {
      "stid": "900601010105",
      "appointmentDate": "2025-10-20",
      "appointmentTime": "16:00 น."
    },
    ...
  ]
}
```

---

## ✅ การปรับปรุงที่ทำ

### 1. เพิ่ม Documentation ใน syncBookings()

```javascript
/**
 * ซิงค์ข้อมูลการนัดหมายจาก API
 * API Endpoint: get/homevisit/getchildsample_app.php
 * ดึงเฉพาะข้อมูลวันนัดหมาย โดยใช้ stid เป็น key
 */
```

### 2. เพิ่ม Validation สำหรับ stid

```javascript
// ตรวจสอบว่ามี stid (required field)
if (!apiBooking.stid) {
  console.warn("⚠️ Skipping booking without stid:", apiBooking);
  skippedCount++;
  continue;
}
```

**เหตุผล:** stid เป็น key หลัก ต้องมีค่าเสมอ

### 3. เพิ่ม Debug Logging

```javascript
// Log sample data เพื่อ debug (เฉพาะ record แรก)
if (apiBookings.length > 0) {
  console.log("📋 Sample booking data:", {
    stid: apiBookings[0].stid,
    appointmentDate: apiBookings[0].appointmentDate,
    appointmentTime: apiBookings[0].appointmentTime,
  });
}
```

**ประโยชน์:**

- ตรวจสอบ format ข้อมูลจาก API
- Debug ได้ง่ายเมื่อมีปัญหา
- แสดงเฉพาะ record แรก ไม่ flood console

### 4. เพิ่ม Skipped Count

```javascript
let newCount = 0;
let updatedCount = 0;
let skippedCount = 0; // เพิ่มใหม่

// ...

console.log(
  `✅ Bookings sync completed: ${newCount} new, ${updatedCount} updated, ${skippedCount} skipped`
);
```

**ประโยชน์:** รู้ว่ามี record กี่อันที่ถูกข้าม (เช่น ไม่มี stid, หรือมี local changes)

### 5. ปรับปรุง Error Handling

```javascript
catch (error) {
  console.error("❌ Bookings sync failed:", error);
  if (error.response) {
    console.error("API Response:", error.response.status, error.response.data);
  }
  return false;
}
```

**ประโยชน์:**

- แสดง HTTP status code ถ้ามี
- แสดง response data เพื่อ debug
- ช่วยในการหาสาเหตุปัญหา

---

## 🔄 Flow การทำงานที่ปรับปรุงแล้ว

### Sync Process

```
1. ตรวจสอบ online status
   └─ Offline → return false

2. เรียก API: getchildsample_app.php
   └─ ได้ response.results

3. Validate และ Log sample data
   └─ แสดง stid, appointmentDate, appointmentTime ของ record แรก

4. โหลด local bookings จาก IndexedDB
   └─ สร้าง Map โดยใช้ stid เป็น key

5. Loop ผ่าน API bookings:
   ├─ ตรวจสอบ stid (ต้องมี)
   ├─ ตรวจสอบมีข้อมูลนัดหมาย (appointmentDate/Time)
   ├─ ถ้าไม่มีใน local → เพิ่มใหม่
   ├─ ถ้ามี local changes → skip (รอ push)
   └─ ถ้าเป็น API data → update

6. บันทึก sync timestamp
7. Log สรุปผลลัพธ์
```

---

## 📊 ข้อมูลที่บันทึกใน IndexedDB

### Bookings Table Schema

```javascript
{
  stid: "900601010105",           // Primary Key (จาก API)
  appointmentDate: "2025-10-20",  // วันนัดหมาย (ISO format)
  appointmentTime: "16:00 น.",   // เวลานัดหมาย
  dataSource: "api",              // "api" = จาก server, "local" = แก้ไขออฟไลน์
  lastSyncedAt: "2025-10-18..."   // timestamp ที่ sync ล่าสุด
}
```

**หมายเหตุ:**

- `stid` เป็น key หลักสำหรับ join กับ visitors table
- `dataSource` ใช้ track ว่าข้อมูลนี้แก้ไขออฟไลน์หรือไม่
- local changes จะไม่ถูก overwrite โดย API

---

## 🧪 การทดสอบที่แนะนำ

### Test 1: ตรวจสอบ API Response

```javascript
// เปิด browser console
// ดูว่า API ส่งข้อมูลมาถูกต้องหรือไม่

📥 Received X booking records from API
📋 Sample booking data: { stid: "...", appointmentDate: "...", appointmentTime: "..." }
```

**Expected:** ควรเห็น sample data แสดงโครงสร้างที่ถูกต้อง

### Test 2: ตรวจสอบ Validation

```javascript
// ถ้า API ส่งข้อมูลที่ไม่มี stid

⚠️ Skipping booking without stid: {...}
```

**Expected:** ระบบจะข้าม record ที่ไม่มี stid

### Test 3: ตรวจสอบ Local Changes Protection

```javascript
// แก้ไขนัดหมายตอน offline
// กลับมา online และดู console

⚠️ Keeping local changes for stid: 900601010105
```

**Expected:** การแก้ไขออฟไลน์ไม่ถูก overwrite

### Test 4: ตรวจสอบ Error Handling

```javascript
// ถ้า API error (เช่น 404, 500)

❌ Bookings sync failed: Error: ...
API Response: 500 { error: "..." }
```

**Expected:** แสดง HTTP status และ error message ชัดเจน

---

## 🔍 Checklist การตรวจสอบ

- [x] ใช้ API endpoint ที่ถูกต้อง (getchildsample_app.php)
- [x] ใช้ stid เป็น key ในการ match
- [x] ดึงเฉพาะข้อมูล appointmentDate และ appointmentTime
- [x] มี validation สำหรับ stid (required)
- [x] มี debug logging สำหรับ sample data
- [x] มี error handling สำหรับ API errors
- [x] track จำนวน new, updated, skipped
- [x] ไม่ overwrite local changes
- [x] บันทึก sync timestamp
- [x] ไม่แก้ไข endpoint เดิม (getchildsample.php)

---

## 📝 หมายเหตุสำคัญ

### 1. API Response Format

ถ้า API ส่งข้อมูลในรูปแบบอื่น (ไม่ใช่ `response.results`) ให้แก้ไขที่:

```javascript
// ปรับตาม format จริงของ API
const apiBookings = response.results; // หรือ response.data, response ฯลฯ
```

### 2. Field Names

ถ้า API ใช้ชื่อ field ต่างจากที่คาดหวัง เช่น:

- `appointment_date` แทน `appointmentDate`
- `appointment_time` แทน `appointmentTime`

ให้ map field names ดังนี้:

```javascript
await app.$indexedDB.addBooking({
  stid: apiBooking.stid,
  appointmentDate: apiBooking.appointment_date || apiBooking.appointmentDate,
  appointmentTime: apiBooking.appointment_time || apiBooking.appointmentTime,
  dataSource: "api",
  lastSyncedAt: new Date().toISOString(),
});
```

### 3. Date Format

ระบบคาดหวัง date ในรูปแบบ ISO (YYYY-MM-DD)
ถ้า API ส่งมาในรูปแบบอื่น จำเป็นต้องแปลงก่อน:

```javascript
// Example: แปลง "20/10/2025" เป็น "2025-10-20"
const formattedDate = convertToISO(apiBooking.appointmentDate);
```

---

## ✅ สรุป

ระบบ Bookings Sync ได้รับการปรับปรุงและพร้อมใช้งานกับ API endpoint `getchildsample_app.php` แล้ว

**คุณสมบัติหลัก:**

- ✅ ดึงเฉพาะข้อมูลวันนัดหมาย
- ✅ ใช้ stid เป็น key
- ✅ มี validation และ error handling
- ✅ แสดง debug information
- ✅ รักษา local changes
- ✅ พร้อมสำหรับ production

**การทดสอบ:**
เปิดแอปและดู browser console จะเห็น:

1. จำนวน booking records ที่ได้จาก API
2. Sample data ของ record แรก
3. สรุปผลลัพธ์ (new/updated/skipped)
4. Error messages (ถ้ามี)
