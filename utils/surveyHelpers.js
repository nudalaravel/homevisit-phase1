/**
 * Survey helper functions
 */

/**
 * Options for question 3, 6, and 71 (who participated)
 */
export const PARTICIPANT_OPTIONS = [
  { value: 1, label: "แม่ (1)" },
  { value: 3, label: "พ่อ (3)" },
  { value: 5, label: "ย่า/ยาย (5)" },
  { value: 7, label: "ปู่/ตา (7)" },
  { value: 9, label: "พี่/น้อง (9)" },
  { value: 11, label: "ลุง/ป้า/น้า/อา (11)" },
  { value: 13, label: "อื่นๆ (13)" },
];

/**
 * Activity answer options (for Q5 and Q9)
 */
export const ACTIVITY_ANSWER_OPTIONS = [
  { value: 1, label: "ทำได้ (1)" },
  { value: 2, label: "ทำได้บ้าง (2)" },
  { value: 3, label: "ทำไม่ได้ (3)" },
];

/**
 * Check if step should be skipped based on answers
 * @param {number} step - Step number
 * @param {Object} answers - Answers object
 * @param {Object} visitorData - Visitor data
 * @returns {boolean} True if should skip
 */
export function shouldSkipStep(step, answers, visitorData) {
  // Skip Q1 scenario: skip steps 2-9
  const skippedFromQ1 = answers.q1 === 3;
  const skippedFromQ2 = answers.q2 === 3;
  const isFirstVisit = visitorData && Number(visitorData.time) === 1;

  switch (step) {
    case 3:
    case 4:
    case 5:
      // Skip if first visit
      return isFirstVisit;
    case 5:
      // Also skip if Q2 was "ไม่ได้"
      return !visitorData || Number(visitorData.time) === 1 || skippedFromQ2;
    case 9:
      // Skip if Q2 was "ไม่ได้"
      return skippedFromQ2;
    case 11:
      // Skip image upload if Q1 or Q2 was "ไม่ได้"
      return skippedFromQ1 || skippedFromQ2;
    default:
      return false;
  }
}

/**
 * Calculate next step considering skip logic
 * @param {number} currentStep - Current step
 * @param {Object} answers - Answers object
 * @param {Object} visitorData - Visitor data
 * @returns {number} Next step number
 */
export function calculateNextStep(currentStep, answers, visitorData) {
  // Skip from step 1 to step 10 if Q1 === 3
  if (currentStep === 1 && answers.q1 === 3) {
    return 10;
  }

  let nextStep = currentStep + 1;

  // Skip steps 3, 4, 5 if first visit
  if (nextStep === 3 && visitorData && Number(visitorData.time) === 1) {
    return 6;
  }

  // Skip step 5 if not first visit but Q2 === 3
  if (nextStep === 5 && shouldSkipStep(5, answers, visitorData)) {
    nextStep++;
  }

  // Skip step 9 if Q2 === 3
  if (nextStep === 9 && answers.q2 === 3) {
    nextStep++;
  }

  // Skip step 11 if Q1 === 3 or Q2 === 3
  if (nextStep === 11 && (answers.q1 === 3 || answers.q2 === 3)) {
    nextStep++;
  }

  return nextStep;
}

/**
 * Calculate previous step considering skip logic
 * @param {number} currentStep - Current step
 * @param {Object} answers - Answers object
 * @param {Object} visitorData - Visitor data
 * @returns {number} Previous step number
 */
export function calculatePrevStep(currentStep, answers, visitorData) {
  // Skip from step 10 to step 1 if Q1 === 3
  if (currentStep === 10 && answers.q1 === 3) {
    return 1;
  }

  let prevStep = currentStep - 1;

  // Skip from step 6 to step 2 if first visit
  if (currentStep === 6 && visitorData && Number(visitorData.time) === 1) {
    return 2;
  }

  // Skip step 11 when going back from step 12 if Q1 === 3 or Q2 === 3
  if (prevStep === 11 && (answers.q1 === 3 || answers.q2 === 3)) {
    prevStep--;
  }

  // Skip step 9 when going back from step 10 if Q2 === 3
  if (prevStep === 9 && answers.q2 === 3) {
    prevStep--;
  }

  // Skip step 5 when going back from step 6 if conditions met
  if (prevStep === 5 && shouldSkipStep(5, answers, visitorData)) {
    prevStep--;
  }

  return prevStep;
}

/**
 * Validate survey step
 * @param {number} step - Step number
 * @param {Object} answers - Answers object
 * @param {Object} displayImages - Display images object
 * @param {number} currentImageSubStep - Current image sub-step
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateSurveyStep(step, answers, displayImages = {}, currentImageSubStep = 1) {
  switch (step) {
    case 1:
      if (answers.q1 == null) {
        return { valid: false, error: "กรุณาเลือกคำตอบ" };
      }
      if (answers.q1 === 3 && !answers.q1_des?.trim()) {
        return { valid: false, error: "กรุณากรอกเหตุผล" };
      }
      break;

    case 2:
      if (answers.q2 == null) {
        return { valid: false, error: "กรุณาเลือกคำตอบ" };
      }
      if (answers.q2 === 3 && !answers.q2_des?.trim()) {
        return { valid: false, error: "กรุณากรอกเหตุผล" };
      }
      break;

    case 3:
      if (!answers.q3 || answers.q3.length === 0) {
        return { valid: false, error: "กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก" };
      }
      if (answers.q3.includes(13) && !answers.q3_des?.trim()) {
        return { valid: false, error: 'กรุณากรอกข้อมูลในช่อง "อื่นๆ ระบุ"' };
      }
      break;

    case 4:
      if (answers.q4 == null) {
        return { valid: false, error: "กรุณาเลือกคำตอบ" };
      }
      break;

    case 6:
      if (answers.q6 == null) {
        return { valid: false, error: "กรุณาเลือกคำตอบ" };
      }
      if (answers.q6 === 13 && !answers.q6_other?.trim()) {
        return { valid: false, error: 'กรุณากรอกข้อมูลในช่อง "อื่นๆ ระบุ"' };
      }
      break;

    case 7:
      if (answers.q7 == null) {
        return { valid: false, error: "กรุณาเลือกคำตอบ" };
      }
      if (answers.q7 === 1) {
        if (!answers.q71 || answers.q71.length === 0) {
          return { valid: false, error: "กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก" };
        }
        if (answers.q71.includes(13) && !answers.q71_des?.trim()) {
          return { valid: false, error: 'กรุณากรอกข้อมูลในช่อง "อื่นๆ โปรดระบุ"' };
        }
      }
      break;

    case 8:
      if (answers.q8 == null) {
        return { valid: false, error: "กรุณาเลือกคำตอบ" };
      }
      break;

    case 10:
      if (!answers.endHour || !answers.endMinute) {
        return { valid: false, error: "กรุณาเลือกเวลาสิ้นสุดการเยี่ยม" };
      }
      break;

    case 11:
      if (answers.q1 !== 3 && answers.q2 !== 3) {
        if (currentImageSubStep === 2 && !displayImages.image2) {
          return { valid: false, error: "กรุณาอัพโหลดรูปภาพที่ 2" };
        }
      }
      break;

    case 12:
      // Validation would be in the appointment form
      break;
  }

  return { valid: true, error: null };
}

/**
 * Initialize default end time
 * @returns {Object} { endHour, endMinute }
 */
export function getDefaultEndTime() {
  const now = new Date();
  return {
    endHour: String(now.getHours()).padStart(2, "0"),
    endMinute: String(now.getMinutes()).padStart(2, "0"),
  };
}

/**
 * Generate hour and minute options for time selection
 * @returns {Object} { hourOptions, minuteOptions }
 */
export function generateTimeOptions() {
  const hourOptions = [{ value: null, text: "-ชั่วโมง-" }];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, "0");
    hourOptions.push({ value: hour, text: hour });
  }

  const minuteOptions = [{ value: null, text: "-นาที-" }];
  for (let i = 0; i < 60; i++) {
    const minute = String(i).padStart(2, "0");
    minuteOptions.push({ value: minute, text: minute });
  }

  return { hourOptions, minuteOptions };
}

/**
 * Normalize image URL for display
 * @param {string|Object} image - Image data (can be string or object)
 * @param {boolean} isOffline - Whether currently offline
 * @returns {string|null} Normalized URL
 */
export function normalizeImageUrl(image, isOffline = false) {
  if (!image) return null;

  // If it's an object with base64 and url
  if (typeof image === "object") {
    // Offline: use base64
    if (isOffline && image.base64) {
      return normalizeUrl(image.base64);
    }
    // Online: prefer URL over base64
    const rawUrl = image.url || image.base64 || null;
    return normalizeUrl(rawUrl);
  }

  // Legacy: string format
  return normalizeUrl(image);
}

/**
 * Normalize URL string
 * @param {string} url - URL string
 * @returns {string|null} Normalized URL
 */
function normalizeUrl(url) {
  if (!url) return null;

  // Base64 data URL - return as is
  if (url.startsWith("data:")) return url;

  // Full URL - return as is
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Relative path - add base URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

/**
 * Parse backward compatible Q7 data
 * @param {*} q7Data - Q7 data from survey
 * @param {*} q71Data - Q71 data from survey (optional)
 * @param {string} q71DesData - Q71 description data
 * @returns {Object} { q7, q71, q71_des }
 */
export function parseQ7Data(q7Data, q71Data, q71DesData) {
  let q7Value = null;
  let q71Array = [];
  let q71DesValue = "";

  if (q7Data != null) {
    if (Array.isArray(q7Data)) {
      // Old format: q7 was array
      if (q7Data.length > 0) {
        q7Value = 1; // มี
        q71Array = q7Data.map((v) => Number(v));
        q71DesValue = q71DesData || "";
      } else {
        q7Value = 0; // ไม่มี
      }
    } else {
      // New format: q7 is single value
      q7Value = Number(q7Data);
      q71Array = Array.isArray(q71Data) ? q71Data.map((v) => Number(v)) : [];
      q71DesValue = q71DesData || "";
    }
  }

  return { q7: q7Value, q71: q71Array, q71_des: q71DesValue };
}

/**
 * Load image from different formats
 * @param {*} surveyImageData - Survey image data
 * @param {Array} surveyImageKeys - Image keys
 * @param {Function} getImageFn - Function to get image from store
 * @returns {Promise<Array>} Array of loaded images
 */
export async function loadSurveyImages(surveyImageData, surveyImageKeys, getImageFn) {
  const loadedImages = [];

  if (Array.isArray(surveyImageData)) {
    // New format: array of images
    for (let i = 0; i < surveyImageData.length; i++) {
      const img = surveyImageData[i];

      if (typeof img === "object" && img !== null) {
        // Object format: { base64, url, key }
        const imageData = img.url || img.base64;
        if (imageData) {
          loadedImages.push({
            base64: img.base64 || null,
            url: img.url || null,
            key: img.key || `pic${i + 1}`,
          });
        } else {
          loadedImages.push(null);
        }
      } else if (typeof img === "string") {
        // String format
        loadedImages.push({
          base64: img.startsWith("data:") ? img : null,
          url: img.startsWith("http") || img.startsWith("/") ? img : null,
          key: `pic${i + 1}`,
        });
      } else {
        loadedImages.push(null);
      }
    }

    // Try to load from images store if missing
    if (surveyImageKeys && Array.isArray(surveyImageKeys)) {
      for (let i = 0; i < surveyImageKeys.length; i++) {
        if (
          (!loadedImages[i] || (!loadedImages[i].url && !loadedImages[i].base64)) &&
          surveyImageKeys[i]
        ) {
          try {
            const imageObject = await getImageFn(surveyImageKeys[i]);
            const imageData = imageObject?.data || imageObject?.image || null;
            if (imageData) {
              loadedImages[i] = {
                base64: imageData.startsWith("data:") ? imageData : null,
                url: imageData.startsWith("http") || imageData.startsWith("/") ? imageData : null,
                key: `pic${i + 1}`,
              };
            }
          } catch (error) {
            // Silent error
          }
        }
      }
    }
  } else if (typeof surveyImageData === "string") {
    // Very old format: single image string
    loadedImages.push({
      base64: surveyImageData.startsWith("data:") ? surveyImageData : null,
      url:
        surveyImageData.startsWith("http") || surveyImageData.startsWith("/")
          ? surveyImageData
          : null,
      key: "pic1",
    });
  } else if (surveyImageKeys && Array.isArray(surveyImageKeys) && surveyImageKeys.length > 0) {
    // No images but have keys - load from store
    for (let i = 0; i < surveyImageKeys.length; i++) {
      if (surveyImageKeys[i]) {
        try {
          const imageObject = await getImageFn(surveyImageKeys[i]);
          const imageData = imageObject?.data || imageObject?.image || null;
          if (imageData) {
            loadedImages.push({
              base64: imageData.startsWith("data:") ? imageData : null,
              url: imageData.startsWith("http") || imageData.startsWith("/") ? imageData : null,
              key: `pic${i + 1}`,
            });
          }
        } catch (error) {
          // Silent error
        }
      }
    }
  }

  return loadedImages.filter(Boolean);
}
