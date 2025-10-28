import {
  MAX_AGE_MONTHS,
  MAX_VISIT_TIME,
  DAYS_BETWEEN_VISITS_THRESHOLD,
} from "./constants";
import { calculateMonthAge } from "./dateHelpers";

/**
 * Calculate next visit time and month age based on previous booking
 * @param {Object} existingBooking - Existing booking data
 * @param {number} selectedYear - Selected year (Christian era)
 * @param {number} selectedMonth - Selected month
 * @param {number} selectedDay - Selected day
 * @param {number} birthMonth - Birth month
 * @param {number} birthYear - Birth year (Buddhist)
 * @returns {Object} { monthAge, timeVisit }
 */
export function calculateNextVisit(
  existingBooking,
  selectedYear,
  selectedMonth,
  selectedDay,
  birthMonth,
  birthYear
) {
  const today = new Date();
  let monthAge = calculateMonthAge(
    birthMonth,
    birthYear,
    today.getMonth() + 1,
    today.getFullYear() + 543
  );
  let timeVisit = 1;

  if (!existingBooking) {
    return { monthAge, timeVisit };
  }

  if (existingBooking.last_visit_date) {
    const selectedDate = new Date(
      selectedYear,
      selectedMonth - 1,
      selectedDay || 1
    );
    const lastVisitDate = new Date(existingBooking.last_visit_date);
    const daysSinceLastVisit = Math.floor(
      (selectedDate - lastVisitDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastVisit > DAYS_BETWEEN_VISITS_THRESHOLD) {
      // Reset if more than threshold days
      timeVisit = 1;
      monthAge = Math.min(monthAge, MAX_AGE_MONTHS);
    } else {
      // Continue sequence
      monthAge = existingBooking.month_age || monthAge;
      timeVisit = (existingBooking.time || 0) + 1;

      // Handle special case: after 4th visit, increase month age and reset time
      if (existingBooking.time === MAX_VISIT_TIME) {
        monthAge = Math.min(
          (existingBooking.month_age || 0) + 1,
          MAX_AGE_MONTHS
        );
        timeVisit = 1;
      } else if (timeVisit > MAX_VISIT_TIME) {
        timeVisit = MAX_VISIT_TIME;
      }
    }
  }

  return { monthAge, timeVisit };
}

/**
 * Check if visitor can record a new visit
 * @param {Object} visitor - Visitor object
 * @returns {boolean} True if can record visit
 */
export function canRecordVisit(visitor) {
  // If current survey is completed, don't allow duplicate recording
  if (visitor.currentSurveyCompleted) {
    return false;
  }

  // First visit can always be recorded
  if (!visitor.time || String(visitor.time) === "1") {
    return true;
  }

  // For visit 2+, must be synced and approved
  return (
    visitor.latestSurveySynced === true || visitor.latestSurveyApproved === true
  );
}

/**
 * Get full visitor name from visitor data
 * @param {Object} visitor - Visitor object
 * @returns {string} Full name
 */
export function getVisitorFullName(visitor) {
  if (visitor.stname) {
    return visitor.stname;
  }

  const parts = [
    visitor.prename || "",
    visitor.fname || "",
    visitor.lname || "",
  ].filter(Boolean);

  return parts.join(" ").trim();
}

/**
 * Prepare visitor data for display
 * @param {Object} visitor - Raw visitor data
 * @param {Object} booking - Booking data
 * @param {Array} completedSurveys - Completed surveys
 * @param {Array} allSurveys - All surveys
 * @returns {Object} Prepared visitor data
 */
export function prepareVisitorData(
  visitor,
  booking,
  completedSurveys,
  allSurveys
) {
  const fullName = getVisitorFullName(visitor);
  const timeVisit = booking?.time || 1;

  // Check if can edit appointment
  let canEdit = true;
  const currentVisitSurvey = allSurveys.find(
    (s) => String(s.time) === String(timeVisit)
  );

  if (currentVisitSurvey) {
    canEdit = currentVisitSurvey.approve_status === 1;
  }

  // Get previous visit survey for approval check
  const previousTimeVisit = parseInt(timeVisit) - 1;
  const previousCompletedSurvey = completedSurveys.find(
    (s) => String(s.time) === String(previousTimeVisit)
  );

  return {
    id: visitor.stid,
    stid: visitor.stid,
    name: fullName,
    nickname: visitor.nickname || "",
    tel: visitor.tel || "",
    address: visitor.address || "",
    appointmentDate: booking?.appointmentDate || null,
    appointmentTime: booking?.appointmentTime || null,
    month_age: booking?.month_age || null,
    time: timeVisit,
    dataSource: visitor.dataSource || "api",
    lastSyncedAt: visitor.lastSyncedAt || null,
    needsPreviousVisit: parseInt(timeVisit) >= 2 && !previousCompletedSurvey,
    latestSurveySynced: previousCompletedSurvey?.synced || false,
    latestSurveyApproved: previousCompletedSurvey?.approve_status === 1,
    currentSurveyCompleted: currentVisitSurvey?.completed || false,
    currentSurveySynced: currentVisitSurvey?.synced || false,
    currentSurveyApproved: currentVisitSurvey?.approve_status === 1,
    currentSurveyNote: currentVisitSurvey?.note || null,
    canEditAppointment: canEdit,
    hasSurveyProgress: !!currentVisitSurvey,
    hasCompletedSurveys: completedSurveys.length > 0,
  };
}

/**
 * Generate year options for select
 * @param {number} yearsBack - Years back from current year (default 2)
 * @param {number} yearsForward - Years forward from current year (default 2)
 * @returns {Array} Array of year options
 */
export function generateYearOptions(yearsBack = 2, yearsForward = 2) {
  const currentYear = new Date().getFullYear() + 543; // Buddhist year
  const options = [];

  for (let i = currentYear - yearsBack; i <= currentYear + yearsForward; i++) {
    options.push({ value: i, text: i.toString() });
  }

  return options;
}
