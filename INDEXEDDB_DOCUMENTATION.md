# เอกสารประกอบ IndexedDB Manager

## ภาพรวม

ไฟล์ `plugins/indexeddb.js` เป็น Plugin สำหรับจัดการ IndexedDB ใน Nuxt.js ซึ่งใช้เก็บข้อมูลในเครื่องผู้ใช้เพื่อรองรับการทำงานแบบออฟไลน์

**ขนาด:** 822 บรรทัด  
**Database:** RipedV2DB (Version 3)  
**Object Stores:** 8 stores

---

## โครงสร้างไฟล์

### 1. Class Definition (บรรทัด 1-11)

```javascript
class IndexedDBManager {
  constructor() {
    this.dbName = "RipedV2DB"; // ชื่อฐานข้อมูล
    this.version = 3; // เวอร์ชัน
    this.db = null; // Instance
    this.isInitialized = false; // สถานะ
  }
}
```

### 2. Initialization (บรรทัด 14-133)

- **`init()`** - เริ่มต้น IndexedDB
  - ตรวจสอบว่า browser รองรับหรือไม่
  - เปิดหรือสร้าง database
  - สร้าง 8 Object Stores พร้อม indexes

### 3. CRUD Operations (บรรทัด 135-251)

#### Generic Methods

| Method     | บรรทัด  | ความหมาย                       |
| ---------- | ------- | ------------------------------ |
| `add()`    | 145-160 | เพิ่มข้อมูลใหม่ (ห้าม key ซ้ำ) |
| `get()`    | 168-183 | ดึงข้อมูลด้วย key              |
| `getAll()` | 190-205 | ดึงข้อมูลทั้งหมด               |
| `update()` | 213-228 | อัพเดทหรือเพิ่มข้อมูล (put)    |
| `delete()` | 236-251 | ลบข้อมูล                       |

### 4. Data Type Specific Operations

#### 🧑 User Operations (บรรทัด 253-288)

```javascript
addUser(user); // เพิ่มผู้ใช้
getUsers(); // ดึงทั้งหมด
getUser(id); // ดึงด้วย ID
updateUser(user); // อัพเดท
deleteUser(id); // ลบ
```

#### 🛒 Order Operations (บรรทัด 290-323)

```javascript
addOrder(order);
getOrders();
getOrder(id);
updateOrder(order);
deleteOrder(id);
```

#### 📦 Product Operations (บรรทัด 325-358)

```javascript
addProduct(product);
getProducts();
getProduct(id);
updateProduct(product);
deleteProduct(id);
```

#### 🏥 Patient Operations (บรรทัด 360-393)

```javascript
addPatient(patient);
getPatients();
getPatient(id);
updatePatient(patient);
deletePatient(id);
```

#### ⚙️ Settings Operations (บรรทัด 395-420)

```javascript
setSetting(key, value); // บันทึกการตั้งค่า
getSetting(key); // ดึงค่าการตั้งค่า
```

#### 🔄 Sync Queue Operations (บรรทัด 422-448)

```javascript
addToSyncQueue(action, data); // เพิ่มเข้าคิว
getSyncQueue(); // ดึงคิวทั้งหมด
removeFromSyncQueue(id); // ลบออกจากคิว
```

#### 🖼️ Image Operations (บรรทัด 450-481)

```javascript
saveData(storeName, data); // บันทึกข้อมูล
deleteData(storeName, key); // ลบข้อมูล
getImage(id); // ดึงรูป
getAllImages(); // ดึงรูปทั้งหมด
deleteImage(id); // ลบรูป
```

#### 📋 Survey Operations (บรรทัด 483-508)

```javascript
saveSurvey(survey); // บันทึก
getSurveys(); // ดึงทั้งหมด
getSurvey(id); // ดึงด้วย ID
deleteSurvey(id); // ลบ
```

### 5. Utility Functions (บรรทัด 510-605)

#### Storage Statistics

```javascript
clearSyncQueue(); // ล้างคิวซิงค์
getStorageStats(); // สถิติการใช้งาน
getStorageQuota(); // ข้อมูล quota จาก browser
```

### 6. Sync Operations (บรรทัด 607-729)

#### API Sync

```javascript
syncFromAPI(); // ดึงข้อมูลจาก API → IndexedDB
processSyncQueue(); // ส่งข้อมูลจากคิว → API
syncItemToAPI(item); // ส่งรายการเดียว → API
```

**การทำงาน:**

1. เมื่อออฟไลน์ → เก็บข้อมูลใน `syncQueue`
2. เมื่อกลับมาออนไลน์ → `processSyncQueue()` ส่งข้อมูลไป API
3. มีระบบ retry สูงสุด 3 ครั้ง

**Sync Actions ที่รองรับ:**

- `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`
- `CREATE_ORDER`, `UPDATE_ORDER`, `DELETE_ORDER`
- `CREATE_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`

### 7. Helper Methods (บรรทัด 731-793)

```javascript
ensureInitialized(); // ตรวจสอบและเริ่มต้น DB ถ้ายังไม่ได้
clearAllData(); // ⚠️ ล้างข้อมูลทั้งหมด
close(); // ปิดการเชื่อมต่อ
```

### 8. Plugin Initialization (บรรทัด 795-822)

```javascript
// สร้าง instance
const indexedDB = new IndexedDBManager();

// เริ่มต้นเมื่อ DOM พร้อม (client-side only)
if (process.client) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      indexedDB.init();
    });
  } else {
    indexedDB.init();
  }
}

// Inject เข้า Vue → เรียกใช้ this.$indexedDB
inject("indexedDB", indexedDB);
```

---

## การใช้งานในComponent

### ตัวอย่างที่ 1: บันทึกข้อมูล Survey

```javascript
async submitSurvey() {
  const surveyData = {
    id: `survey_${Date.now()}`,
    name: this.patientName,
    answers: this.surveyAnswers,
    timestamp: new Date().toISOString()
  }

  // บันทึกใน IndexedDB
  await this.$indexedDB.saveSurvey(surveyData)

  // ถ้าออนไลน์ ส่ง API ทันที
  if (this.$store.state.isOnline) {
    await this.$axios.post('/api/surveys', surveyData)
  } else {
    // ถ้าออฟไลน์ เก็บไว้ในคิว
    await this.$indexedDB.addToSyncQueue('CREATE_SURVEY', surveyData)
  }
}
```

### ตัวอย่างที่ 2: บันทึกรูปภาพ

```javascript
async savePhoto(base64Image) {
  const imageData = {
    id: `img_${Date.now()}`,
    image: base64Image,
    timestamp: new Date().toISOString()
  }

  await this.$indexedDB.saveData('images', imageData)
}
```

### ตัวอย่างที่ 3: ดึงข้อมูลแสดงผล

```javascript
async loadSurveys() {
  if (!this.$indexedDB) {
    console.warn('IndexedDB not available')
    return
  }

  const surveys = await this.$indexedDB.getSurveys()
  this.surveyList = surveys
}
```

### ตัวอย่างที่ 4: Sync เมื่อออนไลน์

```javascript
async syncData() {
  try {
    // Sync จาก API → IndexedDB
    await this.$indexedDB.syncFromAPI()

    // Sync จากคิว → API
    await this.$indexedDB.processSyncQueue()

    this.$bvToast.toast('ซิงค์ข้อมูลสำเร็จ', {
      title: 'สำเร็จ',
      variant: 'success'
    })
  } catch (error) {
    console.error('Sync failed:', error)
  }
}
```

---

## Database Schema

### Users Store

```javascript
{
  id: "user_001",           // keyPath (primary key)
  email: "user@example.com", // Index (unique)
  role: "admin",             // Index
  name: "John Doe",
  lastSync: "2025-10-15T..."
}
```

### Orders Store

```javascript
{
  id: "order_001",
  customer: "John Doe",      // Index
  status: "pending",         // Index
  date: "2025-10-15",        // Index
  items: [...],
  lastSync: "2025-10-15T..."
}
```

### Products Store

```javascript
{
  id: "prod_001",
  name: "Product Name",      // Index
  category: "electronics",   // Index
  price: 1000,               // Index
  lastSync: "2025-10-15T..."
}
```

### Settings Store

```javascript
{
  key: "lastSync",           // keyPath
  value: "2025-10-15T...",
  lastSync: "2025-10-15T..."
}
```

### Sync Queue Store

```javascript
{
  id: 1,                     // keyPath (auto-increment)
  action: "CREATE_USER",     // Index
  timestamp: "2025-10-15T...", // Index
  data: {...},
  retries: 0
}
```

### Patients Store

```javascript
{
  id: 1,                     // keyPath (auto-increment)
  name: "Patient Name",      // Index
  nickname: "Nick",          // Index
  appointmentDate: "2025-10-15", // Index
  lastSync: "2025-10-15T..."
}
```

### Images Store

```javascript
{
  id: "img_001",
  image: "data:image/png;base64,...",
  timestamp: "2025-10-15T..."  // Index
}
```

### Surveys Store

```javascript
{
  id: "survey_001",
  timestamp: "2025-10-15T...", // Index
  answers: [...],
  lastSync: "2025-10-15T..."
}
```

---

## ข้อควรระวัง

### 1. Browser Compatibility

- ต้องใช้ `window.indexedDB` ไม่ใช่ `indexedDB` โดยตรง
- ตรวจสอบว่า browser รองรับก่อนใช้งาน

### 2. Offline Sync

- ข้อมูลที่ทำตอนออฟไลน์จะเก็บไว้ใน `syncQueue`
- พยายาม sync สูงสุด 3 ครั้ง ถ้าล้มเหลวจะลบออกจากคิว
- ควรแจ้งเตือนผู้ใช้เมื่อมีข้อมูลรอซิงค์

### 3. Storage Limits

- IndexedDB มีข้อจำกัดพื้นที่ ประมาณ 50MB - 1GB+ (ขึ้นอยู่กับ browser)
- ใช้ `getStorageQuota()` ตรวจสอบพื้นที่ที่เหลือ
- ควร cleanup ข้อมูลเก่าเป็นระยะ

### 4. Performance

- การเรียก `getAll()` กับข้อมูลจำนวนมากอาจช้า
- ควรใช้ pagination หรือ cursor สำหรับข้อมูลมากๆ
- Transaction จะ auto-commit เมื่อเสร็จสิ้น

### 5. Error Handling

- ทุก operation ควร wrap ด้วย try-catch
- IndexedDB อาจไม่พร้อมใช้งานในบางกรณี (Private mode, disabled)
- มี fallback mechanism (localStorage) สำรองไว้

---

## Best Practices

### 1. ตรวจสอบความพร้อม

```javascript
if (!this.$indexedDB) {
  // Handle gracefully
  return;
}
```

### 2. ใช้ lastSync เพื่อติดตาม

```javascript
const user = {
  ...userData,
  lastSync: new Date().toISOString(),
};
```

### 3. Cleanup ข้อมูลเก่า

```javascript
// ลบข้อมูลที่เก่ากว่า 30 วัน
const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
// ... filter and delete
```

### 4. Monitor Storage

```javascript
const quota = await this.$indexedDB.getStorageQuota();
if (quota.percentage > 90) {
  // แจ้งเตือนผู้ใช้
}
```

---

## เอกสารอ้างอิง

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Can I Use: IndexedDB](https://caniuse.com/indexeddb)
- ไฟล์ที่เกี่ยวข้อง:
  - `plugins/offline.js` - Offline Manager
  - `components/StorageStatus.vue` - UI สำหรับจัดการ storage
  - `pages/survey.vue` - ตัวอย่างการใช้งาน
