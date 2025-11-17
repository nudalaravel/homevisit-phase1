/**
 * สคริปต์จำลองข้อมูลการบันทึกแบบทดสอบครบ 48 ครั้ง
 * เพื่อดูว่าข้อมูล q5x_name และ q9x_name จะออกมาเป็นแบบไหน
 */

// จำลองข้อมูล activities จาก database (ตาม month_age และ time)
// ในความเป็นจริงจะดึงจาก IndexedDB
function getActivitiesFromDB(monthAge, time) {
  // จำลองว่าแต่ละ month_age และ time มี activities 4 ตัว
  // ใช้รูปแบบ: activity_{monthAge}{time}{index} (เช่น activity_111, activity_112, ...)
  const activities = [];
  for (let i = 1; i <= 4; i++) {
    const activityNo = `${monthAge}${time}${i}`;
    activities.push({
      no: activityNo,
      month_age: monthAge,
      time: time
    });
  }
  return activities;
}

// จำลองข้อมูล survey ทั้ง 48 ครั้ง
function simulate48Visits() {
  const surveys = [];
  
  for (let visit = 1; visit <= 48; visit++) {
    // คำนวณ month_age และ time
    const monthAge = Math.ceil(visit / 4); // 1-12
    const time = ((visit - 1) % 4) + 1; // 1-4
    
    // ดึง q9 activities จาก database
    const q9Activities = getActivitiesFromDB(monthAge, time);
    const q9ActivityNames = q9Activities.map(a => a.no);
    
    // q5 = q9 ของ visit ก่อนหน้า
    let q5ActivityNames = [];
    if (visit === 1) {
      // ครั้งแรกไม่มี q5
      q5ActivityNames = ["", "", "", "", ""];
    } else {
      // ใช้ q9 จาก visit ก่อนหน้า
      const previousSurvey = surveys[visit - 2];
      if (previousSurvey && previousSurvey.q9ActivityNames) {
        q5ActivityNames = [...previousSurvey.q9ActivityNames];
        // เติมให้ครบ 5 ตัว
        while (q5ActivityNames.length < 5) {
          q5ActivityNames.push("");
        }
      } else {
        q5ActivityNames = ["", "", "", "", ""];
      }
    }
    
    // เติม q9 ให้ครบ 5 ตัว
    while (q9ActivityNames.length < 5) {
      q9ActivityNames.push("");
    }
    
    const survey = {
      time_visit: visit,
      month_age: monthAge,
      time: time,
      q51_name: q5ActivityNames[0] || "",
      q52_name: q5ActivityNames[1] || "",
      q53_name: q5ActivityNames[2] || "",
      q54_name: q5ActivityNames[3] || "",
      q55_name: q5ActivityNames[4] || "",
      q91_name: q9ActivityNames[0] || "",
      q92_name: q9ActivityNames[1] || "",
      q93_name: q9ActivityNames[2] || "",
      q94_name: q9ActivityNames[3] || "",
      q95_name: q9ActivityNames[4] || "",
      q5ActivityNames: q5ActivityNames,
      q9ActivityNames: q9ActivityNames
    };
    
    surveys.push(survey);
  }
  
  return surveys;
}

// จำลองกรณีที่มี q2 = 3 (skip step 5 และ 9)
function simulate48VisitsWithQ2Skip() {
  const surveys = [];
  
  // กำหนดว่า visit ไหนบ้างที่มี q2 = 3 (skip)
  // ตัวอย่าง: visit 5, 6, 9, 10
  const skipVisits = [5, 6, 9, 10];
  
  for (let visit = 1; visit <= 48; visit++) {
    const monthAge = Math.ceil(visit / 4);
    const time = ((visit - 1) % 4) + 1;
    const isSkipped = skipVisits.includes(visit);
    
    // ดึง q9 activities จาก database (แม้ q2 = 3 ก็ต้องดึง)
    const q9Activities = getActivitiesFromDB(monthAge, time);
    const q9ActivityNames = q9Activities.map(a => a.no);
    
    // q5 = q9 ของ visit ก่อนหน้า (แม้ visit ก่อนหน้าจะ skip ก็ตาม)
    let q5ActivityNames = [];
    if (visit === 1) {
      q5ActivityNames = ["", "", "", "", ""];
    } else {
      const previousSurvey = surveys[visit - 2];
      if (previousSurvey && previousSurvey.q9ActivityNames) {
        // ใช้ q9 จาก visit ก่อนหน้าเสมอ (ไม่สน q2)
        q5ActivityNames = [...previousSurvey.q9ActivityNames];
        while (q5ActivityNames.length < 5) {
          q5ActivityNames.push("");
        }
      } else {
        q5ActivityNames = ["", "", "", "", ""];
      }
    }
    
    // เติมให้ครบ 5 ตัว
    while (q9ActivityNames.length < 5) {
      q9ActivityNames.push("");
    }
    
    const survey = {
      time_visit: visit,
      month_age: monthAge,
      time: time,
      q2: isSkipped ? 3 : 1, // 1 = ทำได้, 3 = ทำไม่ได้
      q51_name: q5ActivityNames[0] || "",
      q52_name: q5ActivityNames[1] || "",
      q53_name: q5ActivityNames[2] || "",
      q54_name: q5ActivityNames[3] || "",
      q55_name: q5ActivityNames[4] || "",
      q91_name: q9ActivityNames[0] || "",
      q92_name: q9ActivityNames[1] || "",
      q93_name: q9ActivityNames[2] || "",
      q94_name: q9ActivityNames[3] || "",
      q95_name: q9ActivityNames[4] || "",
      q5ActivityNames: q5ActivityNames,
      q9ActivityNames: q9ActivityNames,
      note: isSkipped ? "q2=3 (skip step 5, 9)" : ""
    };
    
    surveys.push(survey);
  }
  
  return surveys;
}

// แสดงผลลัพธ์ในรูปแบบตาราง
function displayResults(surveys, title) {
  console.log(`\n${"=".repeat(100)}`);
  console.log(title);
  console.log("=".repeat(100));
  console.log(
    "Visit".padEnd(8) +
    "Month".padEnd(8) +
    "Time".padEnd(8) +
    "q2".padEnd(6) +
    "q51_name".padEnd(12) +
    "q52_name".padEnd(12) +
    "q53_name".padEnd(12) +
    "q54_name".padEnd(12) +
    "q91_name".padEnd(12) +
    "q92_name".padEnd(12) +
    "q93_name".padEnd(12) +
    "q94_name".padEnd(12)
  );
  console.log("-".repeat(100));
  
  surveys.forEach(survey => {
    const q2Display = survey.q2 ? survey.q2.toString() : "-";
    console.log(
      String(survey.time_visit).padEnd(8) +
      String(survey.month_age).padEnd(8) +
      String(survey.time).padEnd(8) +
      q2Display.padEnd(6) +
      (survey.q51_name || "-").padEnd(12) +
      (survey.q52_name || "-").padEnd(12) +
      (survey.q53_name || "-").padEnd(12) +
      (survey.q54_name || "-").padEnd(12) +
      (survey.q91_name || "-").padEnd(12) +
      (survey.q92_name || "-").padEnd(12) +
      (survey.q93_name || "-").padEnd(12) +
      (survey.q94_name || "-").padEnd(12)
    );
  });
}

// แสดงผลลัพธ์แบบละเอียด (แสดง pattern)
function displayDetailedResults(surveys, title) {
  console.log(`\n${"=".repeat(120)}`);
  console.log(title);
  console.log("=".repeat(120));
  
  // แสดงเฉพาะ 10 visits แรกและ 5 visits สุดท้าย
  const first10 = surveys.slice(0, 10);
  const last5 = surveys.slice(43, 48);
  
  console.log("\n--- 10 Visits แรก ---");
  first10.forEach(survey => {
    const q2Display = survey.q2 ? `q2=${survey.q2}` : "";
    console.log(`Visit ${survey.time_visit} (Month ${survey.month_age}, Time ${survey.time}) ${q2Display}`);
    console.log(`  q5: [${survey.q51_name || ""}, ${survey.q52_name || ""}, ${survey.q53_name || ""}, ${survey.q54_name || ""}]`);
    console.log(`  q9: [${survey.q91_name || ""}, ${survey.q92_name || ""}, ${survey.q93_name || ""}, ${survey.q94_name || ""}]`);
    if (survey.note) {
      console.log(`  Note: ${survey.note}`);
    }
    console.log("");
  });
  
  console.log("\n--- 5 Visits สุดท้าย ---");
  last5.forEach(survey => {
    const q2Display = survey.q2 ? `q2=${survey.q2}` : "";
    console.log(`Visit ${survey.time_visit} (Month ${survey.month_age}, Time ${survey.time}) ${q2Display}`);
    console.log(`  q5: [${survey.q51_name || ""}, ${survey.q52_name || ""}, ${survey.q53_name || ""}, ${survey.q54_name || ""}]`);
    console.log(`  q9: [${survey.q91_name || ""}, ${survey.q92_name || ""}, ${survey.q93_name || ""}, ${survey.q94_name || ""}]`);
    if (survey.note) {
      console.log(`  Note: ${survey.note}`);
    }
    console.log("");
  });
  
  // ตรวจสอบ pattern
  console.log("\n--- Pattern Verification ---");
  let errors = [];
  for (let i = 1; i < surveys.length; i++) {
    const current = surveys[i];
    const previous = surveys[i - 1];
    
    // ตรวจสอบว่า q5 ของ visit ปัจจุบัน = q9 ของ visit ก่อนหน้า
    const q5Current = [
      current.q51_name,
      current.q52_name,
      current.q53_name,
      current.q54_name
    ].filter(x => x);
    
    const q9Previous = [
      previous.q91_name,
      previous.q92_name,
      previous.q93_name,
      previous.q94_name
    ].filter(x => x);
    
    if (JSON.stringify(q5Current) !== JSON.stringify(q9Previous)) {
      errors.push({
        visit: current.time_visit,
        expected: q9Previous,
        actual: q5Current
      });
    }
  }
  
  if (errors.length === 0) {
    console.log("✓ Pattern ถูกต้อง: q5 ของทุก visit = q9 ของ visit ก่อนหน้า");
  } else {
    console.log(`✗ พบ ${errors.length} errors:`);
    errors.forEach(err => {
      console.log(`  Visit ${err.visit}: Expected ${JSON.stringify(err.expected)}, Got ${JSON.stringify(err.actual)}`);
    });
  }
}

// รันการจำลอง
console.log("=".repeat(100));
console.log("จำลองข้อมูลการบันทึกแบบทดสอบครบ 48 ครั้ง");
console.log("=".repeat(100));

// กรณีที่ 1: ไม่มี q2 = 3
const surveys1 = simulate48Visits();
displayDetailedResults(surveys1, "กรณีที่ 1: ไม่มี q2 = 3 (ทุก visit ตอบคำถามครบ)");

// กรณีที่ 2: มี q2 = 3 บาง visits
const surveys2 = simulate48VisitsWithQ2Skip();
displayDetailedResults(surveys2, "กรณีที่ 2: มี q2 = 3 ใน visit 5, 6, 9, 10");

// แสดงตารางสรุป
displayResults(surveys1.slice(0, 15), "ตารางสรุป 15 Visits แรก (กรณีปกติ)");
displayResults(surveys2.slice(0, 15), "ตารางสรุป 15 Visits แรก (กรณีมี q2=3)");

console.log("\n" + "=".repeat(100));
console.log("สรุป:");
console.log("1. q5 = q9 ของ visit ก่อนหน้าเสมอ (ไม่สน q2)");
console.log("2. q9 ดึงจาก database ตาม month_age และ time เสมอ (แม้ q2=3)");
console.log("3. Visit 1 ไม่มี q5 (เป็นค่าว่าง)");
console.log("4. q5x_name และ q9x_name ถูกบันทึกเสมอแม้ q2=3");
console.log("=".repeat(100));

