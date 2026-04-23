// Constants for the application

export const MONTH_OPTIONS = [
  { value: 1, text: "มกราคม" },
  { value: 2, text: "กุมภาพันธ์" },
  { value: 3, text: "มีนาคม" },
  { value: 4, text: "เมษายน" },
  { value: 5, text: "พฤษภาคม" },
  { value: 6, text: "มิถุนายน" },
  { value: 7, text: "กรกฎาคม" },
  { value: 8, text: "สิงหาคม" },
  { value: 9, text: "กันยายน" },
  { value: 10, text: "ตุลาคม" },
  { value: 11, text: "พฤศจิกายน" },
  { value: 12, text: "ธันวาคม" },
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** Abbreviated Thai month names without trailing period (e.g. "ม.ค", "ก.พ") — NOTE: despite the name, these are NOT full month names; see THAI_MONTHS_LONG for full names */
export const THAI_MONTHS_FULL = [
  "ม.ค",
  "ก.พ",
  "มี.ค",
  "เม.ย",
  "พ.ค",
  "มิ.ย",
  "ก.ค",
  "ส.ค",
  "ก.ย",
  "ต.ค",
  "พ.ย",
  "ธ.ค",
];

export const TIME_OPTIONS = [
  { value: "08:00 น.", text: "08:00 น." },
  { value: "08:30 น.", text: "08:30 น." },
  { value: "09:00 น.", text: "09:00 น." },
  { value: "09:30 น.", text: "09:30 น." },
  { value: "10:00 น.", text: "10:00 น." },
  { value: "10:30 น.", text: "10:30 น." },
  { value: "11:00 น.", text: "11:00 น." },
  { value: "11:30 น.", text: "11:30 น." },
  { value: "12:00 น.", text: "12:00 น." },
  { value: "12:30 น.", text: "12:30 น." },
  { value: "13:00 น.", text: "13:00 น." },
  { value: "13:30 น.", text: "13:30 น." },
  { value: "14:00 น.", text: "14:00 น." },
  { value: "14:30 น.", text: "14:30 น." },
  { value: "15:00 น.", text: "15:00 น." },
  { value: "15:30 น.", text: "15:30 น." },
  { value: "16:00 น.", text: "16:00 น." },
  { value: "16:30 น.", text: "16:30 น." },
  { value: "17:00 น.", text: "17:00 น." },
  { value: "17:30 น.", text: "17:30 น." },
  { value: "18:00 น.", text: "18:00 น." },
  { value: "18:30 น.", text: "18:30 น." },
];

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const BUDDHIST_ERA_OFFSET = 543;

export const MAX_AGE_MONTHS = 48;

export const MAX_VISIT_TIME = 4;

export const DAYS_BETWEEN_VISITS_THRESHOLD = 21;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const MAX_IMAGE_WIDTH = 1200;
export const MAX_IMAGE_HEIGHT = 1200;

export const IMAGE_QUALITY = 0.8;

export const VALIDATION_RULES = {
  minNameLength: 2,
  maxNameLength: 100,
  minNicknameLength: 2,
  maxNicknameLength: 50,
  minPhoneDigits: 9,
  maxAddressLength: 500,
};

/** Full Thai month names (e.g. "มกราคม", "กุมภาพันธ์") — these are the actual full-length names */
export const THAI_MONTHS_LONG = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export const CAREGIVER_LABELS = {
  '1': 'แม่',
  '2': 'พ่อ',
  '3': 'ย่า/ยาย',
  '4': 'ปู่/ตา',
  '5': 'พี่น้อง',
  '6': 'ลุง/ป้า/น้ำ/อา',
  '7': 'ญาติคนอื่น',
  '8': 'ไม่ใช่ญาติ'
};
