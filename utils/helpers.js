/**
 * Utility Helper Functions
 * ฟังก์ชันช่วยเหลือทั่วไปที่ใช้ในหลายที่
 */

/**
 * Debounce function - หน่วงเวลาการเรียกฟังก์ชัน
 * ใช้สำหรับลดจำนวนครั้งที่เรียกฟังก์ชันที่มีการเรียกบ่อยๆ เช่น input, scroll, resize
 * 
 * @param {Function} func - ฟังก์ชันที่ต้องการ debounce
 * @param {number} wait - เวลารอ (milliseconds) ก่อนเรียกฟังก์ชัน
 * @returns {Function} - ฟังก์ชันที่ถูก debounce แล้ว
 * 
 * @example
 * const debouncedSave = debounce(() => saveData(), 1000)
 * // เรียก debouncedSave() หลายครั้ง แต่จะรันจริงครั้งเดียวหลังจาก 1 วินาที
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    // ล้าง timeout เดิม
    clearTimeout(timeout);
    
    // ตั้ง timeout ใหม่
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle function - จำกัดจำนวนครั้งที่เรียกฟังก์ชันในช่วงเวลาหนึ่ง
 * แตกต่างจาก debounce คือจะเรียกฟังก์ชันทันทีครั้งแรก แล้วรอ wait ms ก่อนเรียกครั้งถัดไป
 * 
 * @param {Function} func - ฟังก์ชันที่ต้องการ throttle
 * @param {number} wait - เวลารอขั้นต่ำระหว่างการเรียก (milliseconds)
 * @returns {Function} - ฟังก์ชันที่ถูก throttle แล้ว
 * 
 * @example
 * const throttledScroll = throttle(() => handleScroll(), 100)
 * // เรียก throttledScroll() หลายครั้ง แต่จะรันเฉพาะทุก 100ms
 */
export function throttle(func, wait) {
  let timeout = null;
  let lastRan = null;
  
  return function executedFunction(...args) {
    const context = this;
    
    if (!lastRan) {
      // เรียกทันทีครั้งแรก
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      // ล้าง timeout เดิม
      clearTimeout(timeout);
      
      // ตั้ง timeout ใหม่
      timeout = setTimeout(() => {
        if (Date.now() - lastRan >= wait) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, wait - (Date.now() - lastRan));
    }
  };
}

/**
 * Deep clone object - สำเนา object แบบ deep copy
 * 
 * @param {*} obj - Object ที่ต้องการ clone
 * @returns {*} - Object ที่ถูก clone แล้ว
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Format file size - แปลงขนาดไฟล์เป็นรูปแบบที่อ่านง่าย
 * 
 * @param {number} bytes - ขนาดไฟล์ในหน่วย bytes
 * @param {number} decimals - จำนวนทศนิยม (default: 2)
 * @returns {string} - ขนาดไฟล์ในรูปแบบที่อ่านง่าย เช่น "1.5 MB"
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate unique ID - สร้าง ID ที่ไม่ซ้ำกัน
 * 
 * @returns {string} - Unique ID
 */
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sleep function - หยุดการทำงานชั่วคราว
 * 
 * @param {number} ms - เวลารอ (milliseconds)
 * @returns {Promise} - Promise ที่ resolve หลังจากเวลาที่กำหนด
 * 
 * @example
 * await sleep(1000) // รอ 1 วินาที
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

