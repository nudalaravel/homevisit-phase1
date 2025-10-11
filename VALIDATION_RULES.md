# Form Validation Rules

## Login Page (`/login`)

### ชื่อผู้ใช้ (Username)

| Rule       | Description                | Error Message                                      |
| ---------- | -------------------------- | -------------------------------------------------- |
| Required   | ไม่สามารถเว้นว่างได้       | กรุณากรอกชื่อผู้ใช้                                |
| Min Length | อย่างน้อย 3 ตัวอักษร       | ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร               |
| Pattern    | a-z, A-Z, 0-9, \_ เท่านั้น | ชื่อผู้ใช้ต้องเป็นตัวอักษร ตัวเลข หรือ \_ เท่านั้น |

### รหัสผ่าน (Password)

| Rule       | Description          | Error Message                      |
| ---------- | -------------------- | ---------------------------------- |
| Required   | ไม่สามารถเว้นว่างได้ | กรุณากรอกรหัสผ่าน                  |
| Min Length | อย่างน้อย 6 ตัวอักษร | รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร |

---

## Dashboard - Add Patient Modal

### ชื่อ-นามสกุล (Name) \*

| Rule       | Description                     | Error Message                       |
| ---------- | ------------------------------- | ----------------------------------- |
| Required   | ต้องกรอก                        | กรุณากรอกชื่อ-นามสกุล               |
| Min Length | อย่างน้อย 2 ตัวอักษร            | ชื่อต้องมีอย่างน้อย 2 ตัวอักษร      |
| Max Length | ไม่เกิน 100 ตัวอักษร            | ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร) |
| Auto Trim  | เว้นวรรคหน้าหลังถูกตัดอัตโนมัติ | -                                   |

### ชื่อเล่น (Nickname) \*

| Rule       | Description                     | Error Message                          |
| ---------- | ------------------------------- | -------------------------------------- |
| Required   | ต้องกรอก                        | กรุณากรอกชื่อเล่น                      |
| Min Length | อย่างน้อย 2 ตัวอักษร            | ชื่อเล่นต้องมีอย่างน้อย 2 ตัวอักษร     |
| Max Length | ไม่เกิน 50 ตัวอักษร             | ชื่อเล่นยาวเกินไป (สูงสุด 50 ตัวอักษร) |
| Auto Trim  | เว้นวรรคหน้าหลังถูกตัดอัตโนมัติ | -                                      |

### เบอร์โทรศัพท์ (Phone)

| Rule       | Description                            | Error Message                       |
| ---------- | -------------------------------------- | ----------------------------------- |
| Optional   | ไม่จำเป็นต้องกรอก                      | -                                   |
| Pattern    | 0-9, -, space, () เท่านั้น             | รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง       |
| Min Digits | อย่างน้อย 9 หลัก (ไม่นับ -, space, ()) | เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก |
| Auto Trim  | เว้นวรรคหน้าหลังถูกตัดอัตโนมัติ        | -                                   |

### ที่อยู่ (Address)

| Rule       | Description                     | Error Message                          |
| ---------- | ------------------------------- | -------------------------------------- |
| Optional   | ไม่จำเป็นต้องกรอก               | -                                      |
| Max Length | ไม่เกิน 500 ตัวอักษร            | ที่อยู่ยาวเกินไป (สูงสุด 500 ตัวอักษร) |
| Auto Trim  | เว้นวรรคหน้าหลังถูกตัดอัตโนมัติ | -                                      |

---

## Dashboard - Edit Patient Modal

### ชื่อ-นามสกุล (Name)

| Rule     | Description       | Error Message |
| -------- | ----------------- | ------------- |
| Disabled | ไม่สามารถแก้ไขได้ | -             |

### ชื่อเล่น (Nickname)

| Rule     | Description       | Error Message |
| -------- | ----------------- | ------------- |
| Disabled | ไม่สามารถแก้ไขได้ | -             |

### เบอร์โทรศัพท์ (Phone)

| Rule       | Description                            | Error Message                       |
| ---------- | -------------------------------------- | ----------------------------------- |
| Optional   | ไม่จำเป็นต้องกรอก                      | -                                   |
| Pattern    | 0-9, -, space, () เท่านั้น             | รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง       |
| Min Digits | อย่างน้อย 9 หลัก (ไม่นับ -, space, ()) | เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก |
| Auto Trim  | เว้นวรรคหน้าหลังถูกตัดอัตโนมัติ        | -                                   |

### ที่อยู่ (Address)

| Rule       | Description                     | Error Message                          |
| ---------- | ------------------------------- | -------------------------------------- |
| Optional   | ไม่จำเป็นต้องกรอก               | -                                      |
| Max Length | ไม่เกิน 500 ตัวอักษร            | ที่อยู่ยาวเกินไป (สูงสุด 500 ตัวอักษร) |
| Auto Trim  | เว้นวรรคหน้าหลังถูกตัดอัตโนมัติ | -                                      |

---

## Dashboard - Schedule Appointment Modal

### ชื่อ-นามสกุล (Name)

| Rule     | Description       | Error Message |
| -------- | ----------------- | ------------- |
| Disabled | ไม่สามารถแก้ไขได้ | -             |

### เดือน (Month) \*

| Rule     | Description | Error Message   |
| -------- | ----------- | --------------- |
| Required | ต้องเลือก   | กรุณาเลือกเดือน |
| Range    | 1-12        | -               |

### วัน (Day) \*

| Rule       | Description                    | Error Message         |
| ---------- | ------------------------------ | --------------------- |
| Required   | ต้องเลือก                      | กรุณาเลือกวัน         |
| Range      | 1-31                           | -                     |
| Valid Date | ตรวจสอบจำนวนวันในเดือนที่เลือก | เดือนนี้มีเพียง X วัน |

### ปี (Year) \*

| Rule     | Description          | Error Message |
| -------- | -------------------- | ------------- |
| Required | ต้องเลือก            | กรุณาเลือกปี  |
| Range    | ปีปัจจุบัน -2 ถึง +2 | -             |

### เวลาเริ่มต้นการเยี่ยมบ้าน (Time) \*

| Rule     | Description    | Error Message  |
| -------- | -------------- | -------------- |
| Required | ต้องเลือก      | กรุณาเลือกเวลา |
| Options  | 08:00-18:00 น. | -              |

---

## Validation Behavior

### When Validation Triggers:

1. **On Blur** (เมื่อออกจากช่องกรอก):

   - Username (Login)
   - Password (Login)
   - Name (Add/Edit Patient)
   - Nickname (Add/Edit Patient)
   - Phone (Add/Edit Patient)
   - Address (Add/Edit Patient)

2. **On Input** (เมื่อกรอกข้อมูล):

   - Clears existing errors
   - Real-time feedback

3. **On Change** (เมื่อเลือกค่าใหม่):

   - Month, Day, Year (Appointment)
   - Time (Appointment)
   - Clears existing errors

4. **On Submit** (เมื่อกดบันทึก):
   - Validates all fields
   - Prevents submission if invalid
   - Shows all error messages
   - Focuses on first invalid field (auto-scroll)

### Visual Feedback:

- ✅ Valid: Normal border (grey)
- ❌ Invalid: Red border + error message below field
- ⚪ Disabled: Grey background, cannot edit
- 🔴 Required: Red asterisk (\*) next to label

### Auto-Trim:

All text inputs automatically trim whitespace:

- Leading spaces removed
- Trailing spaces removed
- Multiple spaces preserved in middle

### Error Clearing:

Errors automatically clear when:

- User starts typing
- User selects a new value
- Field becomes valid

---

## Phone Number Format Examples

### ✅ Valid Formats:

- `081-234-5678`
- `0812345678`
- `081 234 5678`
- `(081) 234-5678`
- `081-2345678`

### ❌ Invalid Formats:

- `08123456` (too short, less than 9 digits)
- `081-234-567A` (contains letters)
- `081.234.5678` (contains dots)
- `+66812345678` (contains +)

---

## Date Validation Examples

### ✅ Valid Dates:

- 31 มกราคม 2568 (January has 31 days)
- 29 กุมภาพันธ์ 2568 (if leap year)
- 30 เมษายน 2568 (April has 30 days)

### ❌ Invalid Dates:

- 31 กุมภาพันธ์ 2568 ❌ "เดือนนี้มีเพียง 28 วัน" (or 29 in leap year)
- 31 เมษายน 2568 ❌ "เดือนนี้มีเพียง 30 วัน"
- 31 มิถุนายน 2568 ❌ "เดือนนี้มีเพียง 30 วัน"

---

## Notes

- **\*** = Required field (ต้องกรอก)
- All error messages are in Thai language
- Validation is performed client-side (no server calls for validation)
- Form submission is prevented if any field is invalid
- Toast notifications appear on successful submission
- Loading screen shows during data saving

---

## Accessibility

### Keyboard Navigation:

- Tab/Shift+Tab: Navigate between fields
- Enter: Submit form (when focused on submit button)
- Space: Toggle checkbox/show password

### Screen Readers:

- Proper ARIA labels
- Error announcements
- Required field indicators
- Invalid state announcements

### Visual Indicators:

- Color is not the only indicator
- Icons for required fields (\*)
- Text error messages
- Border color changes
