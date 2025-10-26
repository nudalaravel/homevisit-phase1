# เอกสารสรุป Flow ระบบบันทึกข้อมูลการเยี่ยมบ้าน (Home Visit Recording System)

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [โครงสร้างข้อมูล (Data Structure)](#โครงสร้างข้อมูล)
3. [Flow การทำงานหลัก](#flow-การทำงานหลัก)
4. [Sync Mechanism](#sync-mechanism)
5. [Edit & Update Flows](#edit--update-flows)
6. [State Management](#state-management)
7. [API Integration](#api-integration)

---

## ภาพรวมระบบ

### 🎯 วัตถุประสงค์

ระบบบันทึกข้อมูลการเยี่ยมบ้านสำหรับติดตามพัฒนาการเด็ก โดยสามารถทำงาน **Offline-First** และ sync ข้อมูลกับ server เมื่อออนไลน์

### 🏗️ Technology Stack

- **Frontend Framework**: Nuxt.js 2 (Vue.js)
- **State Management**: Vuex
- **Local Storage**: IndexedDB
- **Styling**: Bootstrap Vue + Custom CSS
- **Authentication**: Custom Offline Auth Plugin

### 📱 หน้าจอหลัก

1. **หน้าแรก (index.vue)**: แสดงรายชื่อผู้รับบริการและจัดการนัดหมาย
2. **หน้าแบบสอบถาม (survey.vue)**: บันทึกข้อมูลการเยี่ยมบ้าน
3. **หน้า Login (login.vue)**: เข้าสู่ระบบ (รองรับ offline)

---

## โครงสร้างข้อมูล

### 📦 IndexedDB Stores

#### 1. **visitors** (ข้อมูลผู้รับบริการ)

```javascript
{
  stid: string,              // Primary Key - รหัสประจำตัว
  prename: string,           // คำนำหน้า
  fname: string,             // ชื่อ
  lname: string,             // นามสกุล
  stname: string,            // ชื่อเต็ม
  nickname: string,          // ชื่อเล่น
  tel: string,               // เบอร์โทรศัพท์
  address: string,           // ที่อยู่
  month_birth: number,       // เดือนเกิด
  year_birth: number,        // ปีเกิด (พ.ศ.)
  homevisitor: string,       // รหัสผู้เยี่ยมบ้าน
  dataSource: 'api'|'local', // แหล่งข้อมูล
  lastSyncedAt: string       // เวลา sync ล่าสุด
}

Indexes:
- homevisitor
- stid (unique)
```

#### 2. **bookings** (ข้อมูลนัดหมาย)

```javascript
{
  stid: string,              // Primary Key - รหัสประจำตัว
  appointmentDate: string,   // วันนัดหมาย (YYYY-MM-DD)
  appointmentTime: string,   // เวลานัดหมาย (HH:MM น.)
  month_age: number,         // อายุเป็นเดือน
  time: number,        // ครั้งที่เยี่ยม (1-4)
  last_visit_date: string,   // วันที่เยี่ยมล่าสุด
  dataSource: 'api'|'local',
  lastSyncedAt: string
}

Indexes:
- stid (unique)
- month_age
- time
```

#### 3. **activities** (กิจกรรมตามพัฒนาการ)

```javascript
{
  no: number,                // Primary Key - ลำดับกิจกรรม
  month_age: number,         // อายุเป็นเดือน
  time: number,        // ครั้งที่เยี่ยม (1-4)
  title: string,             // หัวข้อกิจกรรม
  activity: string,          // คำอธิบายกิจกรรม
  activity_detail: string,   // รายละเอียดกิจกรรม
  objective: string          // จุดประสงค์
}

Indexes:
- month_age
- time
- [month_age + time] (compound)
```

#### 4. **survey_progress** (ความคืบหน้าแบบสอบถาม)

```javascript
{
  id: string,                // Primary Key - survey_${stid}_${time}_${timestamp}
  stid: string,              // รหัสประจำตัว
  time: number,        // ครั้งที่เยี่ยม
  month_age: number,         // อายุเป็นเดือน
  timeStart: string,         // เวลาเริ่มต้น (YYYY-MM-DD HH:MM:SS)
  timeEnd: string,           // เวลาสิ้นสุด (YYYY-MM-DD HH:MM:SS)
  appointmentDate: string,   // วันนัดหมาย
  appointmentTime: string,   // เวลานัดหมาย
  currentStep: number,       // ขั้นตอนปัจจุบัน (1-12)
  currentActivityIndex: number,  // index กิจกรรมปัจจุบัน (Q9)
  currentQ5Index: number,    // index กิจกรรมปัจจุบัน (Q5)
  answers: {                 // คำตอบทั้งหมด
    q1: number,              // 1=ได้, 3=ไม่ได้
    q2: number,              // 1=ได้, 3=ไม่ได้
    q3: number[],            // Multiple choice (1-13)
    q4: string,              // อื่นๆ ของ q3
    q5: {                    // Dynamic activities
      [activityNo]: number   // 1=ทำได้, 2=ทำได้บ้าง, 3=ทำไม่ได้
    },
    q6: number[],            // Multiple choice (1-13)
    q6_other: string,        // อื่นๆ ของ q6
    q7: number,              // 1=ได้, 3=ไม่ได้
    q8: number,              // 1=ได้, 3=ไม่ได้
    q9: {                    // Dynamic activities
      [activityNo]: number   // 1=ทำได้, 2=ทำได้บ้าง, 3=ทำไม่ได้
    },
    notes: string,           // บันทึกผู้เยี่ยมบ้าน
    endHour: string,         // ชั่วโมงสิ้นสุด (00-23)
    endMinute: string        // นาทีสิ้นสุด (00-59)
  },
  newAppointment: {          // นัดหมายครั้งต่อไป
    day: number,
    month: number,
    year: number,
    time: string
  },
  surveyImage: string,       // Base64 image data
  surveyImageKey: string,    // Key สำหรับ images store
  completed: boolean,        // สถานะเสร็จสิ้น
  synced: boolean,           // สถานะ sync กับ server
  approve_status: number,    // 0=ยังไม่อนุมัติ, 1=อนุมัติแล้ว
  lastUpdated: string        // เวลาอัพเดตล่าสุด
}

Indexes:
- stid
- time
- completed
- lastUpdated
```

#### 5. **images** (รูปภาพ)

```javascript
{
  key: string,               // Primary Key
  data: string               // Base64 image data (WebP format)
}
```

#### 6. **sync_queue** (คิวการ sync)

```javascript
{
  id: number,                // Primary Key (auto-increment)
  type: string,              // 'UPDATE_VISITOR' | 'SUBMIT_SURVEY'
  stid: string,              // รหัสประจำตัว
  surveyId: string,          // Survey ID (for SUBMIT_SURVEY)
  time: number,        // ครั้งที่เยี่ยม
  month_age: number,         // อายุเป็นเดือน
  data: object,              // ข้อมูลที่ต้อง sync
  payload: object,           // API payload
  timestamp: string          // เวลาที่เพิ่มเข้า queue
}

Indexes:
- timestamp
- type
```

---

## Flow การทำงานหลัก

### 🔐 1. Login Flow

```
┌─────────────┐
│ User Login  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Check Online/Offline Status │
└──────┬──────────────────────┘
       │
       ├─── Online ────────────┐
       │                       ▼
       │              ┌───────────────────┐
       │              │ Validate with API │
       │              └────────┬──────────┘
       │                       │
       │                       ▼
       │              ┌────────────────────┐
       │              │ Store in IndexedDB │
       │              └────────┬───────────┘
       │                       │
       └─── Offline ──┐        │
                      ▼        ▼
              ┌──────────────────────┐
              │ Check Local Storage  │
              └──────┬───────────────┘
                     │
                     ▼
              ┌─────────────────┐
              │ Validate & Login│
              └──────┬──────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Redirect to /│
              └──────────────┘
```

**ไฟล์ที่เกี่ยวข้อง:**

- `plugins/auth-offline.js` - จัดการ authentication offline
- `plugins/auth-custom.js` - API authentication
- `middleware/auth.js` - ตรวจสอบ auth ก่อนเข้าหน้า

### 📊 2. Dashboard Flow (index.vue)

```
┌─────────────┐
│   Mounted   │
└──────┬──────┘
       │
       ▼
┌────────────────────────┐
│ Initialize System      │
│ - Check Online Status  │
│ - Init IndexedDB       │
└──────┬─────────────────┘
       │
       ├─── Online ───────────┐
       │                      ▼
       │            ┌────────────────────┐
       │            │ Sync Visitors      │
       │            │ from API           │
       │            └────────┬───────────┘
       │                     │
       │                     ▼
       │            ┌────────────────────┐
       │            │ Process Sync Queue │
       │            └────────┬───────────┘
       │                     │
       └─── Offline ─────────┤
                             │
                             ▼
                    ┌────────────────────┐
                    │ Load Visitors      │
                    │ from IndexedDB     │
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ Load Bookings      │
                    │ from IndexedDB     │
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ Get Survey Status  │
                    │ for each visitor   │
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ Render UI with:    │
                    │ - Visitor info     │
                    │ - Booking status   │
                    │ - Sync status      │
                    └────────────────────┘
```

**Key Features:**

- แสดงรายชื่อผู้รับบริการ
- แสดงสถานะนัดหมาย
- แสดงสถานะ sync (รอ sync, รออนุมัติ, อนุมัติแล้ว)
- จัดการปุ่มต่างๆ ตามสถานะ

### 📝 3. Schedule Appointment Flow

```
┌────────────────────┐
│ Click "กำหนดนัดหมาย"│
└────────┬───────────┘
         │
         ▼
┌────────────────────────────┐
│ Get Visitor from IndexedDB │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Calculate month_age from   │
│ birth date to today        │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Check existing booking     │
└────────┬───────────────────┘
         │
         ├─── Has Booking ────────────┐
         │                            ▼
         │                   ┌─────────────────────┐
         │                   │ Editing Appointment │
         │                   │ - Keep month_age    │
         │                   │ - Keep time   │
         │                   └────────┬────────────┘
         │                            │
         └─── New Booking ────┐       │
                              ▼       ▼
                     ┌──────────────────────────┐
                     │ Check last_visit_date    │
                     └────────┬─────────────────┘
                              │
                              ├─── > 21 days ────┐
                              │                   ▼
                              │          ┌────────────────────┐
                              │          │ - Recalc month_age │
                              │          │ - Increment visit  │
                              │          │ - Reset if visit=4 │
                              │          └────────┬───────────┘
                              │                   │
                              └─── ≤ 21 days ─────┤
                                                  │
                                                  ▼
                                         ┌────────────────────┐
                                         │ - Keep month_age   │
                                         │ - Increment visit  │
                                         │ - Advance if visit=4│
                                         └────────┬───────────┘
                                                  │
                                                  ▼
                                         ┌────────────────────┐
                                         │ Fetch Activity     │
                                         │ by month_age +     │
                                         │ time         │
                                         └────────┬───────────┘
                                                  │
                                                  ▼
                                         ┌────────────────────┐
                                         │ Show Modal with    │
                                         │ - Date selectors   │
                                         │ - Time selector    │
                                         │ - Activity info    │
                                         └────────┬───────────┘
                                                  │
                                                  ▼
                                         ┌────────────────────┐
                                         │ Save to bookings   │
                                         │ table in IndexedDB │
                                         └────────────────────┘
```

**Business Rules:**

1. **ครั้งที่ 1**: สามารถแก้ไขนัดหมายได้เสมอ
2. **ครั้งที่ 2+**: ต้อง sync แบบทดสอบครั้งก่อนแล้วเท่านั้น
3. **time**: วนซ้ำ 1→2→3→4→1→2→...
4. **month_age**: เพิ่มขึ้นตามอายุจริง หรือเมื่อ time วนรอบ

### 🏃 4. Record Visit Flow

```
┌────────────────────┐
│ Click "บันทึกเยี่ยม"│
└────────┬───────────┘
         │
         ▼
┌────────────────────────────┐
│ Check canRecordVisit()     │
└────────┬───────────────────┘
         │
         ├─── time = 1 ──→ [Allow]
         │
         └─── time > 1 ───┐
                                ▼
                       ┌─────────────────────┐
                       │ Check Latest Survey │
                       │ - synced = true?    │
                       │ - approve_status=1? │
                       └────────┬────────────┘
                                │
                                ├─── ✓ Pass ──→ [Allow]
                                │
                                └─── ✗ Fail ──→ [Disabled]
                                                "รอการอนุมัติ"
```

**Validation:**

- ครั้งที่ 1: อนุญาตเสมอ
- ครั้งที่ 2+: ต้อง **synced=true** และ **approve_status=1**

### 📋 5. Survey Flow (survey.vue)

```
┌─────────────┐
│   Mounted   │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ Check localStorage       │
│ - surveyEdit? → Edit mode│
│ - surveyPatient? → New   │
└──────┬───────────────────┘
       │
       ├─── Edit Mode ──────────┐
       │                        ▼
       │               ┌────────────────────┐
       │               │ Load from IndexedDB│
       │               │ survey_progress    │
       │               └────────┬───────────┘
       │                        │
       └─── New Mode ───────────┤
                                │
                                ▼
                       ┌────────────────────┐
                       │ Check Incomplete   │
                       │ Survey             │
                       └────────┬───────────┘
                                │
                                ├─── Found ──→ Resume
                                │
                                └─── Not Found ─→ Create New
                                                 Generate surveyId
                                                 Set timeStart
```

**Survey Steps (12 steps):**

| Step | Content                       | Answer Type                      |
| ---- | ----------------------------- | -------------------------------- |
| 1    | ผู้ปกครองควบคุมกิจกรรม        | Single (1=ได้, 3=ไม่ได้)         |
| 2    | เด็กควบคุมกิจกรรม             | Single (1=ได้, 3=ไม่ได้)         |
| 3    | ใครทำกิจกรรมร่วม              | Multiple (1-13) + อื่นๆ          |
| 4    | Q5: Dynamic Activities        | 1=ทำได้, 2=ทำได้บ้าง, 3=ทำไม่ได้ |
| 5    | แหล่งข้อมูลพัฒนาการ           | Multiple (1-13) + อื่นๆ          |
| 6    | แหล่งข้อมูลมาจาก              | Single (1=ได้, 3=ไม่ได้)         |
| 7    | ครอบครัวอื่นช่วย              | Single (1=ได้, 3=ไม่ได้)         |
| 8    | Q9: Dynamic Activities        | 1=ทำได้, 2=ทำได้บ้าง, 3=ทำไม่ได้ |
| 9    | บันทึกผู้เยี่ยม + เวลาสิ้นสุด | Textarea + Time (HH:MM)          |
| 10   | รูปกิจกรรม                    | Image Upload                     |
| 11   | นัดหมายครั้งต่อไป             | Date + Time                      |
| 12   | Summary                       | -                                |

**Auto-save:**

- บันทึก progress ทุกครั้งที่เปลี่ยน step
- บันทึก progress ทุกครั้งที่เปลี่ยน activity (Q5, Q9)
- เก็บ `completed`, `synced`, `approve_status` เดิมไว้

### 💾 6. Submit Survey Flow

```
┌────────────────────┐
│ Click "บันทึก"     │
└────────┬───────────┘
         │
         ▼
┌────────────────────────────┐
│ Validate Current Step      │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Check if Already Completed │
└────────┬───────────────────┘
         │
         ├─── completed=true ────────┐
         │                           ▼
         │                  ┌──────────────────────┐
         │                  │ Edit Mode:           │
         │                  │ - Keep completed=true│
         │                  │ - Keep synced status │
         │                  │ - No new appointment │
         │                  │ - Toast: "แก้ไขสำเร็จ"│
         │                  └────────┬─────────────┘
         │                           │
         └─── completed=false ───────┤
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │ New Completion:      │
                            │ - Set completed=true │
                            │ - Set synced=false   │
                            │ - approve_status=0   │
                            └────────┬─────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │ Calculate Next Visit │
                            │ - New month_age      │
                            │ - New time     │
                            └────────┬─────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │ Create New Booking   │
                            │ in IndexedDB         │
                            └────────┬─────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │ Add to Sync Queue    │
                            │ type: SUBMIT_SURVEY  │
                            └────────┬─────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │ Toast: "รอการซิงค์"  │
                            └────────┬─────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │ Navigate to /        │
                            └──────────────────────┘
```

---

## Sync Mechanism

### 🔄 Sync Queue System

```
┌────────────────────┐
│  User Action       │
│ (Update/Submit)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────────────┐
│ Add to sync_queue          │
│ - type: UPDATE_VISITOR |   │
│         SUBMIT_SURVEY      │
│ - payload: API data        │
│ - timestamp                │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Wait for Online Event      │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ processSyncQueue()         │
│ - Fetch all queue items    │
│ - Sort by timestamp        │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ For each item:             │
│ 1. Call API                │
│ 2. Update local data       │
│ 3. Update sync status      │
│ 4. Remove from queue       │
└────────┬───────────────────┘
         │
         ├─── Success ──→ Remove from queue
         │
         └─── Fail ────→ Keep in queue
                        Retry later
```

**Sync Types:**

#### 1. UPDATE_VISITOR

```javascript
{
  type: 'UPDATE_VISITOR',
  stid: '900601010105',
  data: {
    tel: '0812345678',
    address: 'บ้านเลขที่ 123',
    dataSource: 'local',
    lastSyncedAt: '2025-10-24T10:30:00'
  },
  payload: {
    variable: [['tel', 'address']],
    value: [['0812345678', 'บ้านเลขที่ 123']],
    pk: [['stid']],
    pkval: [['900601010105']],
    tb: 'homevisitor_sample_students'
  }
}
```

#### 2. SUBMIT_SURVEY

```javascript
{
  type: 'SUBMIT_SURVEY',
  surveyId: 'survey_900601010105_2_1729754400000',
  stid: '900601010105',
  time: 2,
  month_age: 12,
  data: {
    // Full survey_progress object
    answers: {...},
    timeStart: '2025-10-24 09:00:00',
    timeEnd: '2025-10-24 10:30:00',
    surveyImage: 'data:image/webp;base64,...',
    completed: true,
    synced: false,
    approve_status: 0
  }
}
```

### 🌐 Online/Offline Detection

```
┌─────────────────┐
│ window.online   │◄─── Listen
│ window.offline  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Update Vuex State           │
│ $store.state.isOnline       │
└────────┬────────────────────┘
         │
         ├─── Online ──────────┐
         │                     ▼
         │            ┌─────────────────────┐
         │            │ processSyncQueue()  │
         │            │ (with 2s debounce)  │
         │            └─────────────────────┘
         │
         └─── Offline ─────────┐
                               ▼
                      ┌─────────────────────┐
                      │ Queue operations    │
                      │ for later sync      │
                      └─────────────────────┘
```

---

## Edit & Update Flows

### ✏️ 1. Edit Visitor Information

```
┌────────────────────┐
│ Click Visitor Name │
└────────┬───────────┘
         │
         ▼
┌────────────────────────────┐
│ Open Edit Modal            │
│ - Name (disabled)          │
│ - Nickname (disabled)      │
│ - Tel (editable)           │
│ - Address (editable)       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Validate Input             │
│ - Tel: 9+ digits           │
│ - Address: max 500 chars   │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Update IndexedDB           │
│ - Set dataSource='local'   │
│ - Update lastSyncedAt      │
└────────┬───────────────────┘
         │
         ├─── Online ──────────┐
         │                     ▼
         │            ┌─────────────────────┐
         │            │ Sync to API         │
         │            │ (immediate)         │
         │            └────────┬────────────┘
         │                     │
         │                     ├─── Success ──→ Update dataSource='api'
         │                     │
         │                     └─── Fail ──────→ Add to sync_queue
         │
         └─── Offline ────────────→ Add to sync_queue
```

### 📝 2. Edit Survey Record

```
┌────────────────────────────┐
│ Visit History Modal        │
│ Click "แก้ไขบันทึกการเยี่ยม"│
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Store in localStorage:     │
│ {                          │
│   mode: 'edit',            │
│   surveyId: 'xxx',         │
│   stid: 'xxx',             │
│   ...                      │
│ }                          │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Navigate to /survey        │
│ ?mode=edit&surveyId=xxx    │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ survey.vue mounted()       │
│ - Detect edit mode         │
│ - Load survey from DB      │
│ - Populate all fields      │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ User edits answers         │
│ - Auto-save on navigation  │
│ - Keep completed=true      │
│ - Keep synced status       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Click "บันทึก"             │
│ - Update IndexedDB         │
│ - NO new appointment       │
│ - Add to sync queue        │
│ - Toast: "แก้ไขสำเร็จ"     │
└────────────────────────────┘
```

### 📷 3. Edit Photo

```
┌────────────────────────────┐
│ Visit History Modal        │
│ Click "แก้ไขรูปภาพ"         │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Open Photo Edit Modal      │
│ - Show current image       │
│ - Upload new button        │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ User selects new image     │
│ - Validate: type, size     │
│ - Convert to WebP          │
│ - Resize: max 1200x1200    │
│ - Show preview             │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Click "บันทึก"             │
└────────┬───────────────────┘
         │
         ├─── Has new image ──────┐
         │                        ▼
         │               ┌────────────────────┐
         │               │ Delete old image   │
         │               │ from images store  │
         │               └────────┬───────────┘
         │                        │
         │                        ▼
         │               ┌────────────────────┐
         │               │ Save new image     │
         │               │ key: survey_xxx_ts │
         │               └────────┬───────────┘
         │                        │
         └─── Remove only ────────┤
                                  │
                                  ▼
                         ┌────────────────────┐
                         │ Update survey      │
                         │ - surveyImage      │
                         │ - surveyImageKey   │
                         └────────┬───────────┘
                                  │
                                  ▼
                         ┌────────────────────┐
                         │ Add to sync queue  │
                         └────────────────────┘
```

### 🔄 4. Edit Appointment

```
┌────────────────────────────┐
│ Click Appointment Cell     │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Check canEditAppointment() │
└────────┬───────────────────┘
         │
         ├─── time = 1 ──→ [Allow]
         │
         └─── time > 1 ───┐
                                ▼
                       ┌─────────────────────┐
                       │ Check Latest Survey │
                       │ - synced = true?    │
                       └────────┬────────────┘
                                │
                                ├─── ✓ Pass ──→ [Allow]
                                │
                                └─── ✗ Fail ──→ [Disabled]
                                                "รอการอัพโหลด"
```

**Edit vs Create:**

- **Edit Mode**: มี appointmentDate → keep month_age, time
- **Create Mode**: ไม่มี appointmentDate → calculate new values

---

## State Management

### 📊 Vuex Store

```javascript
// store/index.js
{
  state: {
    isOnline: true,           // Online/offline status
    patientsCount: 0,         // Total visitors count
    user: null                // Current user
  },

  mutations: {
    setOnlineStatus(state, status) {
      state.isOnline = status
    },
    setPatientsCount(state, count) {
      state.patientsCount = count
    },
    setUser(state, user) {
      state.user = user
    }
  },

  actions: {
    async initializeSystem({ commit }, context) {
      // Initialize IndexedDB
      // Check online status
      // Load initial data
    }
  }
}
```

### 💾 LocalStorage Usage

```javascript
// Authentication
'offline_user' → {
  username: string,
  name: string,
  role: string
}

// Temporary data for navigation
'surveyPatient' → {
  stid: string,
  name: string,
  nickname: string,
  month_age: number,
  time: number,
  appointmentDate: string,
  appointmentTime: string
}

// Edit mode indicator
'surveyEdit' → {
  mode: 'edit',
  surveyId: string,
  stid: string,
  name: string,
  nickname: string,
  time: number,
  editAllowed: boolean
}
```

---

## API Integration

### 🔌 API Endpoints

#### 1. Authentication

```
POST /api/parenting2025_census/post/authen.php
Body: { username, password }
Response: { status, message, user_data }
```

#### 2. Get Visitors

```
GET /api/parenting2025_census/get/homevisit/getchild.php
Params: { homevisitor }
Response: { results: [...] }
```

#### 3. Get Activities

```
GET /api/parenting2025_census/get/homevisit/getactivities.php
Response: { results: [...] }
```

#### 4. Update Visitor

```
PUT /api/parenting2025_census/put/homevisit/putdata_arr.php
Body: {
  variable: [['tel', 'address']],
  value: [[tel, address]],
  pk: [['stid']],
  pkval: [[stid]],
  tb: 'homevisitor_sample_students'
}
```

#### 5. Submit Survey

```
POST /api/parenting2025_census/post/homevisit/datarecord1row.php
Body: {
  variable: [...],
  value: [...],
  tb: 'homevisitor_app'
}
```

### 🔄 API Call Pattern

```javascript
// With offline handling
try {
  if (this.$store.state.isOnline) {
    const response = await this.$axios.$get("/api/endpoint");
    // Update IndexedDB with API data
    // Mark as dataSource='api'
  } else {
    // Load from IndexedDB
    // Mark as dataSource='local'
  }
} catch (error) {
  // Fallback to IndexedDB
  // Add to sync queue
}
```

---

## Business Logic Summary

### 📌 Key Rules

#### 1. **month_age Calculation**

```javascript
const birthYear = visitor.year_birth - 543; // Convert to Gregorian
const birthMonth = visitor.month_birth;
const today = new Date();

let month_age =
  (today.getFullYear() - birthYear) * 12 + (today.getMonth() + 1 - birthMonth);

// Cap at 48 months
month_age = Math.min(month_age, 48);
```

#### 2. **time Logic**

- Cycles: 1 → 2 → 3 → 4 → 1 → 2 → ...
- Increments with each visit
- Resets to 1 after visit 4

#### 3. **New Appointment Calculation**

```
If (days since last visit > 21):
  → Recalculate month_age
  → Increment time

Else (≤ 21 days):
  → Keep same month_age
  → Increment time

If (time was 4):
  → Advance month_age by 1
  → Reset time to 1
```

#### 4. **Permission Matrix**

| Action               | Time Visit 1 | Time Visit 2+ (Not Synced) | Time Visit 2+ (Synced, Not Approved) | Time Visit 2+ (Approved) |
| -------------------- | ------------ | -------------------------- | ------------------------------------ | ------------------------ |
| Edit Appointment     | ✅ Always    | ❌ Disabled                | ✅ Allow                             | ✅ Allow                 |
| Record New Visit     | ✅ Always    | ❌ Disabled                | ❌ Disabled                          | ✅ Allow                 |
| Edit Existing Survey | ✅ Always    | ✅ Allow                   | ✅ Allow                             | ✅ Allow                 |
| Edit Photo           | ✅ Always    | ✅ Allow                   | ✅ Allow                             | ✅ Allow                 |

#### 5. **Image Processing**

```javascript
// Convert to WebP
const canvas = document.createElement("canvas");
const maxSize = 1200;

// Resize maintaining aspect ratio
if (width > height) {
  if (width > maxSize) {
    height = (height * maxSize) / width;
    width = maxSize;
  }
} else {
  if (height > maxSize) {
    width = (width * maxSize) / height;
    height = maxSize;
  }
}

// Convert with 80% quality
canvas.toDataURL("image/webp", 0.8);
```

---

## Error Handling

### 🚨 Common Scenarios

#### 1. **Network Failure**

```javascript
try {
  await this.$axios.$get("/api/endpoint");
} catch (error) {
  // Fallback to IndexedDB
  const localData = await this.$indexedDB.getData();
  // Add to sync queue
  await this.$indexedDB.addToSyncQueue(operation);
  // Inform user
  this.$toast.warning("บันทึกข้อมูลสำเร็จ (จะซิงค์เมื่อออนไลน์)");
}
```

#### 2. **Missing Data**

```javascript
// Check before navigation
if (!booking || !booking.month_age || !booking.time) {
  this.$toast.error("ไม่พบข้อมูลการนัดหมาย กรุณากำหนดนัดหมายก่อน");
  return;
}
```

#### 3. **Validation Errors**

```javascript
validateCurrentStep() {
  switch(this.currentStep) {
    case 1:
      if (!this.answers.q1) {
        this.$toast.error('กรุณาเลือกคำตอบ')
        return false
      }
      break
    // ... other cases
  }
  return true
}
```

---

## Performance Considerations

### ⚡ Optimization Strategies

#### 1. **IndexedDB Indexing**

- Primary keys on frequently queried fields
- Compound indexes for complex queries
- Regular cleanup of old data

#### 2. **Image Optimization**

- Convert to WebP format
- Resize before storage
- Lazy loading in UI

#### 3. **Debouncing**

- Sync queue processing (2 seconds)
- Auto-save (immediate, but with state check)

#### 4. **Pagination**

- Load visitors in chunks (if needed)
- Lazy load visit history

---

## Testing Checklist

### ✅ Critical Flows

#### Login

- [ ] Online login with valid credentials
- [ ] Online login with invalid credentials
- [ ] Offline login with stored credentials
- [ ] Offline login without stored credentials

#### Dashboard

- [ ] Load visitors (online)
- [ ] Load visitors (offline)
- [ ] Display correct sync status
- [ ] Correct button states based on status

#### Appointments

- [ ] Create first appointment
- [ ] Edit existing appointment
- [ ] Create appointment after 21+ days
- [ ] Create appointment within 21 days
- [ ] Disabled state when not synced

#### Survey

- [ ] Create new survey
- [ ] Resume incomplete survey
- [ ] Navigate between steps
- [ ] Dynamic activities display
- [ ] Auto-save progress
- [ ] Image upload
- [ ] Submit survey
- [ ] Edit completed survey

#### Sync

- [ ] Add to queue when offline
- [ ] Process queue when online
- [ ] Retry failed syncs
- [ ] Update local data after sync

#### Edit Flows

- [ ] Edit visitor information
- [ ] Edit survey record
- [ ] Edit photo only
- [ ] Permission checks

---

## Deployment Notes

### 📦 Build Configuration

```javascript
// nuxt.config.js
export default {
  mode: 'spa',
  target: 'static',

  // PWA configuration
  pwa: {
    manifest: {
      name: 'Home Visit Recording',
      short_name: 'HVR',
      start_url: '/',
      display: 'standalone'
    },
    workbox: {
      offline: true,
      runtimeCaching: [...]
    }
  }
}
```

### 🔒 Security Considerations

1. **Authentication**

   - Store hashed passwords
   - Token-based session management
   - Auto-logout after inactivity

2. **Data Privacy**

   - IndexedDB is origin-specific
   - No sensitive data in localStorage
   - HTTPS only in production

3. **API Security**
   - CORS configuration
   - Rate limiting
   - Input validation

---

## Maintenance & Support

### 🔧 Common Issues

#### "Cannot read property of undefined"

- Check IndexedDB initialization
- Verify data structure
- Add null checks

#### Sync not working

- Check online status detection
- Verify queue items format
- Check API endpoints

#### Image not displaying

- Verify image key in IndexedDB
- Check Base64 format
- Validate image store

### 📚 Resources

- **IndexedDB API**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Nuxt.js Documentation**: https://nuxtjs.org/
- **Bootstrap Vue**: https://bootstrap-vue.org/

---

## Version History

### v2.0 (Current)

- ✅ Complete offline support
- ✅ Survey progress tracking
- ✅ Edit completed surveys
- ✅ Photo management
- ✅ Sync queue system
- ✅ Status tracking (synced, approved)

### v1.0

- Basic visitor management
- Appointment scheduling
- Simple survey form

---

## Contact & Support

**Developer**: AI Assistant (Claude)
**Created**: October 24, 2025
**Last Updated**: October 24, 2025

---

**📌 Note**: This documentation represents the current state of the system. Keep it updated as new features are added or flows are modified.
