# Toast Component Usage

Toast component สำหรับแสดงข้อความแจ้งเตือนที่สวยงามและใช้งานง่าย

## วิธีใช้งาน

### 1. แสดง Toast แบบง่าย

```javascript
// Success
this.$toast.success("บันทึกข้อมูลสำเร็จ");

// Error
this.$toast.error("เกิดข้อผิดพลาด");

// Warning
this.$toast.warning("กรุณาตรวจสอบข้อมูล");

// Info
this.$toast.info("ข้อมูลเพิ่มเติม");
```

### 2. แสดง Toast พร้อม Custom Title

```javascript
this.$toast.success("ข้อมูลถูกบันทึกแล้ว", "บันทึกสำเร็จ");
this.$toast.error("ไม่สามารถเชื่อมต่อได้", "เกิดข้อผิดพลาด");
```

### 3. แสดง Toast แบบกำหนดเอง

```javascript
this.$toast.show({
  title: "หัวข้อ",
  message: "ข้อความ",
  variant: "success", // success, error, warning, info
  duration: 5000, // milliseconds (0 = ไม่ปิดอัตโนมัติ)
});
```

### 4. ปิด Toast ด้วยตัวเอง

```javascript
this.$toast.hide();
```

## ตัวอย่างการใช้งาน

### ในหน้า Login

```javascript
// Success
this.$toast.success("เข้าสู่ระบบสำเร็จ");

// Error
this.$toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
```

### ในหน้า Dashboard

```javascript
// เพิ่มข้อมูล
this.$toast.success("เพิ่มผู้รับบริการสำเร็จ");

// แก้ไขข้อมูล
this.$toast.success("บันทึกข้อมูลสำเร็จ");

// ลบข้อมูล
this.$toast.warning("ลบข้อมูลแล้ว");
```

### กับ Async Operations

```javascript
async saveData() {
  try {
    await this.$axios.post('/api/save', data)
    this.$toast.success('บันทึกข้อมูลสำเร็จ')
  } catch (error) {
    this.$toast.error('ไม่สามารถบันทึกข้อมูลได้')
  }
}
```

## คุณสมบัติ

- ✅ แสดงผลสวยงาม modern design
- ✅ Animation นุ่มนวล
- ✅ Auto-hide (ปิดอัตโนมัติ)
- ✅ สี่ variant: success, error, warning, info
- ✅ Responsive สำหรับมือถือ
- ✅ ปิดได้ด้วยปุ่ม X
- ✅ ใช้งานง่าย เรียกผ่าน `this.$toast`
- ✅ ทำงานได้ทุกหน้า

## Variants

| Variant   | สี     | ใช้เมื่อ       |
| --------- | ------ | -------------- |
| `success` | เขียว  | ทำงานสำเร็จ    |
| `error`   | แดง    | เกิดข้อผิดพลาด |
| `warning` | เหลือง | คำเตือน        |
| `info`    | ฟ้า    | ข้อมูลทั่วไป   |

## เวลาที่แนะนำ (Duration)

- Success: 3000ms (3 วินาที)
- Error: 4000ms (4 วินาที)
- Warning: 3500ms (3.5 วินาที)
- Info: 3000ms (3 วินาที)
- สำหรับข้อความยาว: 5000ms+ (5+ วินาที)

## Tips

1. ใช้ข้อความสั้นๆ กระชับ
2. เลือก variant ให้เหมาะกับสถานการณ์
3. ควรมี toast เพียง 1 อันที่แสดงในเวลาเดียวกัน
4. ข้อความควรสื่อความหมายชัดเจน

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile Browsers: ✅
