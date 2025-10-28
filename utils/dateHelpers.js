import {
  THAI_MONTHS_SHORT,
  THAI_MONTHS_FULL,
  BUDDHIST_ERA_OFFSET,
  DAYS_IN_MONTH,
} from "./constants";

/**
 * Get Thai month name (short version)
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Thai month name
 */
export function getThaiMonthShort(monthIndex) {
  return THAI_MONTHS_SHORT[monthIndex] || "";
}

/**
 * Get Thai month name (full version)
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Thai month name
 */
export function getThaiMonthFull(monthIndex) {
  return THAI_MONTHS_FULL[monthIndex] || "";
}

/**
 * Check if a year is a leap year
 * @param {number} buddhistYear - Buddhist year
 * @returns {boolean} True if leap year
 */
export function isLeapYear(buddhistYear) {
  const gregorianYear = buddhistYear - BUDDHIST_ERA_OFFSET;
  return (
    (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) ||
    gregorianYear % 400 === 0
  );
}

/**
 * Get number of days in a specific month
 * @param {number} month - Month (1-12)
 * @param {number} year - Buddhist year
 * @returns {number} Number of days
 */
export function getDaysInMonth(month, year) {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

/**
 * Generate day options for a specific month
 * @param {number} maxDays - Maximum number of days
 * @returns {Array} Array of day options
 */
export function generateDayOptions(maxDays) {
  return Array.from({ length: maxDays }, (_, i) => ({
    value: i + 1,
    text: String(i + 1),
  }));
}

/**
 * Format appointment date (short version)
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
export function formatAppointmentDateShort(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const day = date.getDate();
  const month = getThaiMonthFull(date.getMonth());
  const year = (date.getFullYear() + BUDDHIST_ERA_OFFSET).toString().slice(-2);

  return `อา. ${day} ${month}. ${year}`;
}

/**
 * Format appointment date (full version)
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {string} timeStr - Time string
 * @returns {string} Formatted date and time
 */
export function formatAppointmentDate(dateStr, timeStr) {
  if (!dateStr) return "ยังไม่ได้กำหนดวันนัดหมาย";

  const date = new Date(dateStr);
  const day = date.getDate();
  const month = getThaiMonthShort(date.getMonth());
  const year = date.getFullYear() + BUDDHIST_ERA_OFFSET;

  return `${day} ${month} ${year} ${timeStr || ""}`;
}

/**
 * Format visit date
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted visit date
 */
export function formatVisitDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const day = date.getDate();
  const month = getThaiMonthFull(date.getMonth());
  const year = date.getFullYear() + BUDDHIST_ERA_OFFSET;

  return `${day} ${month} ${year}`;
}

/**
 * Convert date to Buddhist year format
 * @param {Date} date - Date object
 * @returns {Object} Object with day, month, and buddhist year
 */
export function toBuddhistYear(date) {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear() + BUDDHIST_ERA_OFFSET,
  };
}

/**
 * Convert Buddhist year to Gregorian year
 * @param {number} buddhistYear - Buddhist year
 * @returns {number} Gregorian year
 */
export function toGregorianYear(buddhistYear) {
  return buddhistYear - BUDDHIST_ERA_OFFSET;
}

/**
 * Calculate month age from birth date to selected date
 * @param {number} birthMonth - Birth month
 * @param {number} birthYear - Birth year (Buddhist)
 * @param {number} selectedMonth - Selected month
 * @param {number} selectedYear - Selected year (Buddhist)
 * @param {number} maxAge - Maximum age in months (default 48)
 * @returns {number} Age in months
 */
export function calculateMonthAge(
  birthMonth,
  birthYear,
  selectedMonth,
  selectedYear,
  maxAge = 48
) {
  const selectedGregorianYear = toGregorianYear(selectedYear);
  const birthGregorianYear = toGregorianYear(birthYear);

  let monthAge =
    (selectedGregorianYear - birthGregorianYear) * 12 +
    (selectedMonth - birthMonth);

  // Limit to max age
  if (monthAge > maxAge) {
    monthAge = maxAge;
  }

  // Age must not be negative
  if (monthAge < 0) {
    monthAge = 0;
  }

  return monthAge;
}

/**
 * Create MySQL datetime format
 * @param {Date} date - Date object
 * @returns {string} MySQL datetime string (YYYY-MM-DD HH:MM:SS)
 */
export function toMySQLDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format date to YYYY-MM-DD
 * @param {number} year - Year (Christian era)
 * @param {number} month - Month (1-12)
 * @param {number} day - Day
 * @returns {string} Formatted date string
 */
export function formatDateYMD(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}
