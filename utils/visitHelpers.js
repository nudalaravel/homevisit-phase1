import { MAX_AGE_MONTHS, MAX_VISIT_TIME, DAYS_BETWEEN_VISITS_THRESHOLD } from "./constants";
import { calculateMonthAge } from "./dateHelpers";

/**
 * Calculate next visit time and month age based on previous booking
 * @param {Object} existingBooking - Existing booking data
 * @param {number} selectedYear - Selected year (Christian era)
 * @param {number} selectedMonth - Selected month
 * @param {number} selectedDay - Selected day
 * @param {number} birthMonth - Birth month
 * @param {number} birthYear - Birth year (Buddhist)
 * @returns {Object} { monthAge, timeActivity }
 */
export function calculateNextVisit(
  existingBooking,
  selectedYear,
  selectedMonth,
  selectedDay,
  birthMonth,
  birthYear,
  birthDay = 1
) {
  const today = new Date();
  let monthAge = calculateMonthAge(
    birthMonth,
    birthYear,
    today.getMonth() + 1,
    today.getFullYear() + 543,
    48,
    birthDay,
    today.getDate()
  );
  let timeActivity = 1;

  if (!existingBooking) {
    return { monthAge, timeActivity };
  }

  if (existingBooking.last_visit_date) {
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay || 1);
    const lastVisitDate = new Date(existingBooking.last_visit_date);
    const daysSinceLastVisit = Math.floor((selectedDate - lastVisitDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastVisit > DAYS_BETWEEN_VISITS_THRESHOLD) {
      // Reset if more than threshold days
      timeActivity = 1;
      monthAge = Math.min(monthAge, MAX_AGE_MONTHS);
    } else {
      // Continue sequence
      monthAge = existingBooking.month_age || monthAge;
      timeActivity = (existingBooking.time || 0) + 1;

      // Handle special case: after 4th visit, increase month age and reset time
      if (existingBooking.time === MAX_VISIT_TIME) {
        monthAge = Math.min((existingBooking.month_age || 0) + 1, MAX_AGE_MONTHS);
        timeActivity = 1;
      } else if (timeActivity > MAX_VISIT_TIME) {
        timeActivity = MAX_VISIT_TIME;
      }
    }
  }

  return { monthAge, timeActivity };
}

/**
 * Check if appointment date is today
 * @param {string} appointmentDate - Date string in YYYY-MM-DD format
 * @returns {boolean} True if appointment date matches today
 */
export function isAppointmentToday(appointmentDate) {
  if (!appointmentDate) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  // appointmentDate อาจมี time ต่อท้าย → ตัดเอาเฉพาะ date
  const appointmentStr = String(appointmentDate).split('T')[0].split(' ')[0];
  return todayStr === appointmentStr;
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

  // ถ้าวันนัดหมายไม่ตรงกับวันปัจจุบัน → disabled
  if (!isAppointmentToday(visitor.appointmentDate)) {
    return false;
  }

  // First visit can always be recorded
  if (!visitor.time || String(visitor.time) === "1") {
    return true;
  }

  // For visit 2+, must be synced and approved
  return visitor.latestSurveySynced === true || visitor.latestSurveyApproved === true;
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

  const parts = [visitor.prename || "", visitor.fname || "", visitor.lname || ""].filter(Boolean);

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
export function prepareVisitorData(visitor, booking, completedSurveys, allSurveys) {
  const fullName = getVisitorFullName(visitor);
  const timeActivity = booking?.time || 1;
  const timeVisit = booking?.time_visit || 1;

  // Check if can edit appointment
  // Requirement: ห้ามแก้ไขนัดหมาย ถ้ามีการเริ่มทำแบบสำรวจไปแล้ว (ทุกสถานะ)
  const currentVisitSurvey = allSurveys.find((s) => String(s.time_visit) === String(timeVisit));

  // แก้ไขได้เฉพาะเมื่อไม่มี survey
  // มี survey (ไม่ว่า incomplete, completed, synced, approved) → ห้ามแก้ไข
  const canEdit = !currentVisitSurvey;

  // Get previous visit survey for approval check
  const previousTimeVisit = parseInt(timeVisit) - 1;
  const previousCompletedSurvey = completedSurveys.find(
    (s) => String(s.time_visit) === String(previousTimeVisit)
  );

  // ตรวจสอบว่าต้องการสร้างนัดหมายใหม่หรือไม่
  // เงื่อนไข: มี completed surveys แต่ไม่มี booking.appointmentDate
  const needsNextAppointment = completedSurveys.length > 0 && !booking?.appointmentDate;

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
    time: timeActivity,
    time_visit: timeVisit,
    dataSource: visitor.dataSource || "api",
    lastSyncedAt: visitor.lastSyncedAt || null,
    needsPreviousVisit: parseInt(timeVisit) >= 2 && !previousCompletedSurvey,
    needsNextAppointment,
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
 * Calculate total visit count from completed surveys
 * @param {Array} completedSurveys - Array of completed surveys
 * @returns {number} Total number of completed visits
 */
export function calculateTimeVisit(completedSurveys) {
  if (!completedSurveys || completedSurveys.length === 0) {
    return 1; // First visit
  }

  // นับจำนวนแบบสอบถามที่ completed แล้ว แล้ว +1 สำหรับครั้งถัดไป
  return completedSurveys.length + 1;
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

/**
 * Calculate month age and time activity for next appointment
 * @param {number} visitorBirthMonth - Birth month (1-12)
 * @param {number} visitorBirthYear - Birth year (Buddhist era)
 * @param {number} visitorBirthDay - Birth day (1-31)
 * @param {Date} selectedDate - Selected appointment date
 * @param {Object} existingBooking - Existing booking data (optional)
 * @returns {Object} { monthAge, timeActivity }
 */
export function calculateMonthAgeAndTime(
  visitorBirthMonth,
  visitorBirthYear,
  visitorBirthDay,
  selectedDate,
  existingBooking = null
) {
  // Convert Buddhist year to Christian era
  const birthYear = parseInt(visitorBirthYear) - 543;
  const birthMonth = parseInt(visitorBirthMonth);
  const birthDay = parseInt(visitorBirthDay) || 1; // Default to 1 if not provided

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedDay = selectedDate.getDate();

  // Calculate month age with birth day precision
  let calculatedMonthAge = (selectedYear - birthYear) * 12 + (selectedMonth - birthMonth);

  // Adjust if selected day is before birth day in the month
  if (selectedDay < birthDay) {
    calculatedMonthAge--;
  }

  // Cap at max age (48 months)
  if (calculatedMonthAge > MAX_AGE_MONTHS) {
    calculatedMonthAge = MAX_AGE_MONTHS;
  }

  // Ensure non-negative
  if (calculatedMonthAge < 0) {
    calculatedMonthAge = 0;
  }

  let monthAge = calculatedMonthAge;
  let timeActivity = 1;

  // Check 21-day rule using appointmentDate
  if (existingBooking && existingBooking.appointmentDate) {
    const lastAppointmentDate = new Date(existingBooking.appointmentDate);
    const daysSinceLastAppointment = Math.floor(
      (selectedDate - lastAppointmentDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastAppointment > DAYS_BETWEEN_VISITS_THRESHOLD) {
      // More than 21 days: recalculate month age and reset time
      // ใช้กับทุกกรณี รวมถึงหลังครั้งที่ 4
      monthAge = calculatedMonthAge;
      timeActivity = 1;

      if (monthAge > MAX_AGE_MONTHS) {
        monthAge = MAX_AGE_MONTHS;
      }
    } else if (daysSinceLastAppointment >= 0) {
      // 0-21 days: increment sequence

      // Special case: after 4th visit (creating 5th appointment)
      if (existingBooking.time === MAX_VISIT_TIME) {
        // ครบครั้งที่ 4 แล้ว: ภายใน 21 วัน
        // → เพิ่ม month_age + 1, รีเซ็ต time = 1
        timeActivity = 1;
        monthAge = Math.min((existingBooking.month_age || 0) + 1, MAX_AGE_MONTHS);
      } else {
        // Normal case: increment time, keep month age
        monthAge = existingBooking.month_age || calculatedMonthAge;
        timeActivity = (existingBooking.time || 0) + 1;

        if (timeActivity > MAX_VISIT_TIME) {
          // Cap at max visit time (4)
          timeActivity = MAX_VISIT_TIME;
        }
      }
    } else {
      // Negative days (date in past) - should not happen, but handle safely
      // ใช้ค่าเดิมจาก booking
      monthAge = existingBooking.month_age || calculatedMonthAge;
      timeActivity = existingBooking.time || 1;
    }
  }

  return { monthAge, timeActivity };
}

/**
 * Calculate next appointment data based on completed surveys
 * @param {string} stid - Visitor stid
 * @param {Object} indexedDB - IndexedDB plugin instance
 * @returns {Promise<Object>} Next appointment data
 */
export async function calculateNextAppointment(stid, indexedDB) {
  try {
    // 1. ดึง completed surveys
    const completedSurveys = await indexedDB.getCompletedSurveysByStid(stid);

    if (!completedSurveys || completedSurveys.length === 0) {
      throw new Error("No completed surveys found");
    }

    // 2. ดึง visitor เพื่อหาวันเกิด
    const visitor = await indexedDB.getVisitor(stid);

    if (!visitor || !visitor.month_birth || !visitor.year_birth) {
      throw new Error("Visitor birth date not found");
    }

    // 3. คำนวณ time_visit
    const newTimeVisit = completedSurveys.length + 1;

    // 4. หา survey ล่าสุดตาม time_visit (ลำดับการเยี่ยมจริง)
    // ⚠️ ต้อง sort ตาม time_visit ไม่ใช่ time เพราะ time อาจซ้ำกัน (เช่น 12/1, 13/1, 14/1 ทั้งหมด time=1)
    const sortedByTimeVisit = [...completedSurveys].sort(
      (a, b) => (parseInt(a.time_visit) || 0) - (parseInt(b.time_visit) || 0)
    );
    const lastSurvey = sortedByTimeVisit[sortedByTimeVisit.length - 1];
    const lastVisitDate = new Date(lastSurvey.timeEnd || lastSurvey.timeStart);
    const nextDate = new Date(lastVisitDate);
    nextDate.setDate(nextDate.getDate() + 7);

    // 5. คำนวณ month_age และ time โดยใช้ calculateMonthAgeAndTime (logic เดียวกับ saveAppointment)
    const birthMonth = parseInt(visitor.month_birth);
    const { monthAge, timeActivity } = calculateMonthAgeAndTime(
      birthMonth,
      parseInt(visitor.year_birth),
      parseInt(visitor.day_birth || 1),
      nextDate,
      {
        appointmentDate: lastSurvey.appointmentDate || (lastSurvey.timeStart ? lastSurvey.timeStart.split(' ')[0] : null),
        month_age: Number(lastSurvey.month_age),
        time: Number(lastSurvey.time)
      }
    );
    let newMonthAge = monthAge;
    let newTime = timeActivity;

    // 6. ดึง activities
    const activities = await indexedDB.getActivityByMonthAgeAndTime(newMonthAge, newTime);

    // 7. Format วันที่เป็น YYYY-MM-DD
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, "0");
    const day = String(nextDate.getDate()).padStart(2, "0");
    const appointmentDate = `${year}-${month}-${day}`;

    return {
      appointmentDate,
      appointmentTime: "09:00 น.",
      month_age: newMonthAge,
      time: newTime,
      time_visit: newTimeVisit,
      activities: activities || [],
      lastSurveyTime: lastSurvey.time,
      lastSurveyMonthAge: lastSurvey.month_age,
    };
  } catch (error) {
    console.error("Error calculating next appointment:", error);
    throw error;
  }
}
