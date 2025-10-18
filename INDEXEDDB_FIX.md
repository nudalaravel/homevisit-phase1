# การแก้ไขปัญหา IndexedDB Detection

## ปัญหา

แม้ว่า IndexedDB จะพร้อมใช้งานใน browser (ทดสอบด้วย `window.indexedDB` ผ่าน) แต่ plugin ตรวจสอบด้วย `indexedDB` โดยตรงทำให้เจอ error:

```
indexeddb.js:21 IndexedDB is not available in this browser
```

## สาเหตุ

การเข้าถึง `indexedDB` โดยตรงอาจไม่ได้อ้างอิงถึง global object ที่ถูกต้อง ต้องใช้ `window.indexedDB` แทน

## การแก้ไข

### 1. แก้ไข `plugins/indexeddb.js`

**เดิม:**

```javascript
if (
  typeof indexedDB === "undefined" ||
  !indexedDB ||
  typeof indexedDB.open !== "function"
) {
  console.error("IndexedDB is not available in this browser");
  return null;
}

const request = indexedDB.open(this.dbName, this.version);
```

**ใหม่:**

```javascript
if (
  typeof window === "undefined" ||
  !window.indexedDB ||
  typeof window.indexedDB.open !== "function"
) {
  console.error("IndexedDB is not available in this browser");
  return null;
}

const request = window.indexedDB.open(this.dbName, this.version);
```

### 2. แก้ไข `components/StorageStatus.vue`

**เดิม:**

```javascript
checkIndexedDBAvailability() {
  this.indexedDBAvailable = !!(
    this.$indexedDB &&
    typeof indexedDB !== 'undefined' &&
    indexedDB &&
    typeof indexedDB.open === 'function'
  )
}
```

**ใหม่:**

```javascript
checkIndexedDBAvailability() {
  this.indexedDBAvailable = !!(
    this.$indexedDB &&
    typeof window !== 'undefined' &&
    window.indexedDB &&
    typeof window.indexedDB.open === 'function'
  )
}
```

## ผลลัพธ์

✅ IndexedDB จะถูกตรวจสอบอย่างถูกต้อง
✅ ไม่มี error เกี่ยวกับ "IndexedDB is not available" อีกต่อไป
✅ Database จะ initialize สำเร็จและพร้อมใช้งาน

## วิธีทดสอบ

1. เปิด browser console
2. ควรเห็นข้อความ: `IndexedDB initialized successfully`
3. เช็คใน DevTools → Application → IndexedDB → ควรเห็น `RipedV2DB`

## หมายเหตุ

- ใช้ `window.indexedDB` เสมอเพื่อความชัดเจนและถูกต้อง
- การใช้ `indexedDB` โดยตรงอาจมีปัญหาใน context ที่แตกต่างกัน (SSR, Webpack, etc.)
- ไฟล์ `test-indexeddb.html` ยังคงใช้ `indexedDB` ตรงๆ เพราะเป็นไฟล์ HTML standalone ที่รันใน browser context โดยตรง
