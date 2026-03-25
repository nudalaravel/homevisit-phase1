import { VALIDATION_RULES } from "./constants";

/**
 * Validate phone number
 * @param {string} tel - Phone number
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export function validatePhoneNumber(tel) {
  if (!tel || tel.length === 0) {
    return { valid: true, error: null };
  }

  const phoneRegex = /^[0-9\-\s()]+$/;
  if (!phoneRegex.test(tel)) {
    return { valid: false, error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" };
  }

  const digitsOnly = tel.replace(/[^0-9]/g, "");
  if (digitsOnly.length < VALIDATION_RULES.minPhoneDigits) {
    return {
      valid: false,
      error: `เบอร์โทรศัพท์ต้องมีอย่างน้อย ${VALIDATION_RULES.minPhoneDigits} หลัก`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate name
 * @param {string} name - Name
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "กรุณากรอกชื่อ-นามสกุล" };
  }

  if (name.length < VALIDATION_RULES.minNameLength) {
    return {
      valid: false,
      error: `ชื่อต้องมีอย่างน้อย ${VALIDATION_RULES.minNameLength} ตัวอักษร`,
    };
  }

  if (name.length > VALIDATION_RULES.maxNameLength) {
    return {
      valid: false,
      error: `ชื่อยาวเกินไป (สูงสุด ${VALIDATION_RULES.maxNameLength} ตัวอักษร)`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate nickname
 * @param {string} nickname - Nickname
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export function validateNickname(nickname) {
  if (!nickname || nickname.trim().length === 0) {
    return { valid: false, error: "กรุณากรอกชื่อเล่น" };
  }

  if (nickname.length < VALIDATION_RULES.minNicknameLength) {
    return {
      valid: false,
      error: `ชื่อเล่นต้องมีอย่างน้อย ${VALIDATION_RULES.minNicknameLength} ตัวอักษร`,
    };
  }

  if (nickname.length > VALIDATION_RULES.maxNicknameLength) {
    return {
      valid: false,
      error: `ชื่อเล่นยาวเกินไป (สูงสุด ${VALIDATION_RULES.maxNicknameLength} ตัวอักษร)`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate address
 * @param {string} address - Address
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export function validateAddress(address) {
  if (address && address.length > VALIDATION_RULES.maxAddressLength) {
    return {
      valid: false,
      error: `ที่อยู่ยาวเกินไป (สูงสุด ${VALIDATION_RULES.maxAddressLength} ตัวอักษร)`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate appointment date
 * @param {number} day - Day
 * @param {number} month - Month
 * @param {number} year - Year (Buddhist)
 * @param {Function} getDaysInMonthFn - Function to get days in month
 * @returns {Object} Validation result { valid: boolean, errors: object }
 */
export function validateAppointmentDate(day, month, year, getDaysInMonthFn, timeVisit) {
  const errors = {};

  if (!month) {
    errors.month = "กรุณาเลือกเดือน";
  }

  if (!day) {
    errors.day = "กรุณาเลือกวัน";
  }

  if (!year) {
    errors.year = "กรุณาเลือกปี";
  }

  if (month && day && year) {
    const daysInMonth = getDaysInMonthFn(month, year);

    if (day > daysInMonth) {
      errors.day = `เดือนนี้มีเพียง ${daysInMonth} วัน`;
    }

    // Check if date is in the past
    const selectedDate = new Date(year - 543, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // if (selectedDate < today) {
    //   errors.day = "ไม่สามารถเลือกวันที่ในอดีตได้";
    // }
    // พี่เคให้เพิ่มเงื่อนไข กรณี เยี่ยมครั้งแรก สามารถแก้ไขวันในอดีตได้
    // ✅ check อดีต (ยกเว้น timeVisit = 1)
    if (Number(timeVisit) !== 1 && selectedDate < today) {
      errors.day = "ไม่สามารถเลือกวันที่ในอดีตได้";
    }

  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate file type and size
 * @param {File} file - File object
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export function validateImageFile(file, maxSize) {
  if (!file) {
    return { valid: false, error: "กรุณาเลือกไฟล์" };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `ขนาดไฟล์ใหญ่เกินไป (สูงสุด ${maxSizeMB}MB)`,
    };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "กรุณาเลือกไฟล์รูปภาพเท่านั้น" };
  }

  return { valid: true, error: null };
}

/**
 * Validate form with multiple fields
 * @param {Object} formData - Form data object
 * @param {Object} validators - Object with field validators
 * @returns {Object} Validation result { valid: boolean, errors: object }
 */
export function validateForm(formData, validators) {
  const errors = {};

  for (const [field, validator] of Object.entries(validators)) {
    if (validator && typeof validator === "function") {
      const result = validator(formData[field]);
      if (result && !result.valid) {
        errors[field] = result.error;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
