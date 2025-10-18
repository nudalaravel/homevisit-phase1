import Vue from "vue";
import Swal from "sweetalert2";

// สร้าง instance ของ SweetAlert2 พร้อมค่าเริ่มต้น
const sweetAlert = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success mx-2",
    cancelButton: "btn btn-danger mx-2",
  },
  buttonsStyling: false,
  confirmButtonText: "ใช่, ออกจากระบบ",
  cancelButtonText: "ยกเลิก",
});

// เพิ่ม $swal ใน Vue prototype
Vue.prototype.$swal = sweetAlert;

export default ({ app }, inject) => {
  // Inject $swal ให้ใช้ได้ทั่วทั้งแอป
  inject("swal", sweetAlert);
};
