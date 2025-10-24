# การปรับปรุงการ Sync ข้อมูล Visitors

## วันที่: 18 ตุลาคม 2025

## สรุปการเปลี่ยนแปลง

ปรับปรุงฟังก์ชัน `syncVisitors()` ใน `plugins/system-init.js` ให้มีการจัดการข้อมูลที่ครบถ้วนมากขึ้น โดยเพิ่มการลบรายชื่อที่ API ลบไปแล้ว

---

## ปัญหาเดิม

การ sync ข้อมูล visitors เดิมทำได้เพียง:

- ✅ เพิ่มรายชื่อใหม่จาก API
- ✅ อัพเดทรายชื่อที่มีอยู่แล้ว
- ❌ **ไม่มีการลบรายชื่อที่ API ลบไปแล้ว**

ส่งผลให้:

- ข้อมูลใน IndexedDB ไม่ตรงกับ API
- มีรายชื่อที่ไม่ควรมีแล้วยังคงแสดงในระบบ

---

## การแก้ไข

### 1. เพิ่มการตรวจสอบและลบรายชื่อ

```javascript
// สร้าง Set ของ stid จาก API เพื่อใช้ตรวจสอบรายการที่ถูกลบ
const apiStidSet = new Set();
apiVisitors.forEach((v) => apiStidSet.add(v.stid));
```

### 2. วนลูปตรวจสอบและลบรายการที่ไม่มีใน API

```javascript
// 2. ลบรายการที่ API ไม่มีแล้ว
for (const localVisitor of localVisitors) {
  // ตรวจสอบว่า visitor นี้เป็นของ username ที่กำลัง sync หรือไม่
  if (localVisitor.homevisitor !== username) {
    continue; // ข้ามรายการที่ไม่ใช่ของ username นี้
  }

  // ถ้า API ไม่มี stid นี้แล้ว และไม่ใช่ข้อมูลที่แก้ไขออฟไลน์
  if (!apiStidSet.has(localVisitor.stid)) {
    if (localVisitor.dataSource === "local") {
      // ข้อมูลที่แก้ไขออฟไลน์ - ไม่ลบ เก็บไว้ sync ก่อน
      console.log(
        `⚠️ Keeping local changes for deleted visitor: ${localVisitor.stid}`
      );
    } else {
      // ข้อมูลจาก API ที่ถูกลบแล้ว - ลบออกจาก IndexedDB
      await app.$indexedDB.deleteVisitor(localVisitor.stid);
      deletedCount++;
      console.log(`🗑️ Deleted visitor: ${localVisitor.stid}`);
    }
  }
}
```

### 3. เพิ่ม Counter สำหรับรายการที่ลบ

```javascript
let newCount = 0;
let updatedCount = 0;
let deletedCount = 0; // เพิ่มใหม่
```

### 4. แสดงสรุปผลการ Sync ที่สมบูรณ์

```javascript
console.log(
  `✅ Visitors sync completed: ${newCount} new, ${updatedCount} updated, ${deletedCount} deleted`
);
```

---

## การทำงานของระบบหลังปรับปรุง

### ขั้นตอนการ Sync

1. **ดึงข้อมูลจาก API** → รับรายชื่อ visitors ทั้งหมดจาก server
2. **ดึงข้อมูลจาก IndexedDB** → รับรายชื่อ visitors ที่เก็บในเครื่อง
3. **เพิ่ม/อัพเดท**:
   - ถ้า API มีแต่ IndexedDB ไม่มี → เพิ่มใหม่
   - ถ้าทั้งสองมี → อัพเดท (โดยรักษาข้อมูลที่แก้ไขออฟไลน์ไว้)
4. **ลบ** (✨ ใหม่):
   - ถ้า IndexedDB มีแต่ API ไม่มี → ลบออก
   - **ยกเว้น**: ข้อมูลที่แก้ไขออฟไลน์ (`dataSource: "local"`)

### การป้องกันความปลอดภัย

#### 🛡️ ไม่ลบข้อมูลที่แก้ไขออฟไลน์

```javascript
if (localVisitor.dataSource === "local") {
  // ไม่ลบ - เก็บไว้ sync ก่อน
}
```

#### 🛡️ ตรวจสอบ Username

```javascript
if (localVisitor.homevisitor !== username) {
  continue; // ข้ามรายการที่ไม่ใช่ของ username นี้
}
```

---

## กรณีการใช้งาน (Use Cases)

### Case 1: ผู้ดูแลระบบลบรายชื่อออกจาก API

**สถานการณ์**:

- API เดิมมี: [A, B, C]
- IndexedDB มี: [A, B, C]
- API ลบ C ออก → API มี: [A, B]

**ผลลัพธ์**:

- ✅ A → อัพเดท
- ✅ B → อัพเดท
- 🗑️ C → **ลบออกจาก IndexedDB**

**Console Log**:

```
✅ Visitors sync completed: 0 new, 2 updated, 1 deleted
```

---

### Case 2: มีรายชื่อใหม่เพิ่มใน API

**สถานการณ์**:

- API เดิมมี: [A, B]
- IndexedDB มี: [A, B]
- API เพิ่ม C → API มี: [A, B, C]

**ผลลัพธ์**:

- ✅ A → อัพเดท
- ✅ B → อัพเดท
- ➕ C → **เพิ่มใหม่**

**Console Log**:

```
✅ Visitors sync completed: 1 new, 2 updated, 0 deleted
```

---

### Case 3: แก้ไขออฟไลน์แล้วถูกลบใน API

**สถานการณ์**:

- API มี: [A, B]
- IndexedDB มี: [A, B, C] (C แก้ไขออฟไลน์, `dataSource: "local"`)
- API ลบ C → API มี: [A, B]

**ผลลัพธ์**:

- ✅ A → อัพเดท
- ✅ B → อัพเดท
- ⚠️ C → **ไม่ลบ** (เก็บไว้เพื่อ sync การแก้ไขก่อน)

**Console Log**:

```
⚠️ Keeping local changes for deleted visitor: [stid]
✅ Visitors sync completed: 0 new, 2 updated, 0 deleted
```

---

### Case 4: Sync แบบ Mixed Changes

**สถานการณ์**:

- API เดิมมี: [A, B, C]
- IndexedDB มี: [A, B, C, D]
- API เปลี่ยนเป็น: [A, B, E] (ลบ C, เพิ่ม E)
- D เป็นข้อมูลแก้ไขออฟไลน์

**ผลลัพธ์**:

- ✅ A → อัพเดท
- ✅ B → อัพเดท
- 🗑️ C → **ลบ**
- ⚠️ D → **ไม่ลบ** (เก็บไว้)
- ➕ E → **เพิ่มใหม่**

**Console Log**:

```
⚠️ Keeping local changes for deleted visitor: D
✅ Visitors sync completed: 1 new, 2 updated, 1 deleted
```

---

## การทดสอบ

### เตรียมการทดสอบ

1. **ตรวจสอบข้อมูลเริ่มต้น**:

```javascript
// ใน Browser Console
const visitors = await $nuxt.$indexedDB.getVisitors();
console.log(
  "Visitors:",
  visitors.map((v) => v.stid)
);
```

2. **ทดสอบการลบ**:

   - ลบรายชื่อใน API (ผ่าน database หรือ admin panel)
   - รีเฟรชหน้าเว็บ
   - ตรวจสอบว่ารายชื่อถูกลบออกจาก IndexedDB

3. **ทดสอบการเพิ่ม**:

   - เพิ่มรายชื่อใน API
   - รีเฟรชหน้าเว็บ
   - ตรวจสอบว่ารายชื่อใหม่ปรากฏใน UI

4. **ทดสอบการป้องกัน**:
   - แก้ไขข้อมูลออฟไลน์ (เบอร์โทร/ที่อยู่)
   - ลบรายชื่อนั้นใน API
   - รีเฟรชหน้าเว็บ
   - ตรวจสอบว่ารายชื่อยังคงอยู่ (เพราะมีการแก้ไขออฟไลน์)

---

## ผลกระทบต่อผู้ใช้

### ✅ ข้อดี

1. **ข้อมูลที่ถูกต้อง**: IndexedDB จะตรงกับ API เสมอ
2. **ไม่มีข้อมูลเก่าค้าง**: รายชื่อที่ลบแล้วจะหายไป
3. **ปลอดภัย**: ข้อมูลที่แก้ไขออฟไลน์ไม่ถูกลบ
4. **โปร่งใส**: มี log บอกสถานะการ sync ชัดเจน

### ⚠️ สิ่งที่ต้องระวัง

1. **ข้อมูลที่แก้ไขออฟไลน์**:

   - ถ้าแก้ไขออฟไลน์แล้วถูกลบใน API
   - ข้อมูลจะยังคงอยู่จนกว่าจะ sync สำเร็จ
   - ต้องตรวจสอบว่า sync สำเร็จหรือไม่

2. **การลบจำนวนมาก**:
   - ถ้า API ลบหลายรายการพร้อมกัน
   - อาจใช้เวลาในการ sync นานขึ้นเล็กน้อย

---

## ไฟล์ที่เกี่ยวข้อง

- `plugins/system-init.js` - ฟังก์ชัน `syncVisitors()` (บรรทัด 283-396)
- `plugins/indexeddb.js` - ฟังก์ชัน `deleteVisitor()` (บรรทัด 1000-1003)
- `pages/index.vue` - ฟังก์ชัน `loadVisitors()` และ `initializeSystem()`

---

## สรุป

การปรับปรุงนี้ทำให้ระบบมีความสมบูรณ์มากขึ้น โดย:

- ✅ เพิ่มรายชื่อใหม่จาก API
- ✅ อัพเดทรายชื่อที่มีอยู่
- ✅ **ลบรายชื่อที่ API ลบไปแล้ว** (ใหม่)
- ✅ ป้องกันการลบข้อมูลที่แก้ไขออฟไลน์

ระบบจะทำงานได้ถูกต้องและปลอดภัยมากขึ้น โดยข้อมูลจะตรงกันระหว่าง IndexedDB และ API เสมอ
