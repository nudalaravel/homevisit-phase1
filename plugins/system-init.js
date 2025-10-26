export default function ({ app, store, $axios }, inject) {
  /**
   * System Initialization Manager
   * จัดการการตรวจสอบและเริ่มต้นระบบเมื่อเปิดหน้าเว็บ
   */
  class SystemInitManager {
    constructor() {
      this.isInitialized = false;
      this.activitiesUpdateInterval = null;
      this.ACTIVITIES_UPDATE_INTERVAL = 60 * 60 * 1000; // 1 ชั่วโมง
    }

    /**
     * เริ่มต้นระบบ - เรียกเมื่อเปิดหน้าเว็บ
     */
    async initialize() {
      if (this.isInitialized) return true;

      try {
        console.log("🚀 Starting system initialization...");

        // 1. ตรวจสอบ IndexedDB
        const dbStatus = await this.validateIndexedDB();
        if (!dbStatus) {
          console.error("❌ IndexedDB validation failed");
          return false;
        }

        // 2. โหลดข้อมูลที่อยู่ (จังหวัด อำเภอ ตำบล)
        await this.initializeLocationData();

        // 3. โหลดข้อมูลกิจกรรม
        await this.initializeActivities();

        // 4. ตั้งค่า auto-update สำหรับกิจกรรม
        this.setupActivitiesAutoUpdate();

        this.isInitialized = true;
        console.log("✅ System initialization completed");

        return true;
      } catch (error) {
        console.error("❌ System initialization failed:", error);
        return false;
      }
    }

    /**
     * ตรวจสอบว่า IndexedDB ทำงานปกติหรือไม่
     */
    async validateIndexedDB() {
      try {
        if (!app.$indexedDB) {
          console.error("IndexedDB plugin not found");
          return false;
        }

        // ลองเขียนและอ่านข้อมูลทดสอบ
        const testKey = "system_test";
        const testValue = { test: true, timestamp: Date.now() };

        await app.$indexedDB.setSetting(testKey, testValue);
        const readValue = await app.$indexedDB.getSetting(testKey);

        if (!readValue || readValue.test !== true) {
          console.error("IndexedDB read/write test failed");
          return false;
        }

        console.log("✅ IndexedDB is working properly");
        return true;
      } catch (error) {
        console.error("IndexedDB validation error:", error);
        return false;
      }
    }

    /**
     * โหลดข้อมูลที่อยู่ (จังหวัด อำเภอ ตำบล)
     */
    async initializeLocationData() {
      try {
        console.log("📍 Initializing location data...");

        // ตรวจสอบว่ามีข้อมูลแล้วหรือไม่
        const provinces = await app.$indexedDB.getProvinces();

        if (provinces && provinces.length > 0) {
          console.log("✅ Location data already exists");
          return;
        }

        // ถ้าไม่มีข้อมูล หรือข้อมูลเสีย ให้ลบและดึงใหม่
        console.log("🔄 Clearing old location data...");
        await app.$indexedDB.clearAllLocationData();

        console.log("🔄 Fetching location data from API...");

        // ดึงข้อมูลจังหวัด
        const provincesData = await this.fetchLocationData(
          "/api/parenting2025_census/get/homevisit/getprovince.php"
        );
        if (provincesData && provincesData.length > 0) {
          // Map field names to match IndexedDB schema
          const mappedProvinces = provincesData.map((p) => ({
            prov_code: p.prov_code,
            prov_name: p.province || p.prov_nameT || p.prov_name, // API may use province, prov_nameT, or prov_name
          }));
          await app.$indexedDB.addProvinces(mappedProvinces);
          console.log(`✅ Saved ${mappedProvinces.length} provinces`);
        }

        // ดึงข้อมูลอำเภอ
        const amphoesData = await this.fetchLocationData(
          "/api/parenting2025_census/get/homevisit/getamphoe.php"
        );
        if (amphoesData && amphoesData.length > 0) {
          // Map field names to match IndexedDB schema
          const mappedAmphoes = amphoesData.map((a) => ({
            amp_code: a.amp_code,
            amp_name: a.amphoe || a.amp_nameT || a.amp_name, // API may use amphoe, amp_nameT, or amp_name
            prov_code: a.prov_code,
          }));
          await app.$indexedDB.addAmphoes(mappedAmphoes);
          console.log(`✅ Saved ${mappedAmphoes.length} amphoes`);
        }

        // ดึงข้อมูลตำบล
        const tambonsData = await this.fetchLocationData(
          "/api/parenting2025_census/get/homevisit/gettambon.php"
        );
        if (tambonsData && tambonsData.length > 0) {
          // Map field names to match IndexedDB schema
          const mappedTambons = tambonsData.map((t) => ({
            tam_code: t.tambon_code || t.tam_code, // API uses tambon_code
            tam_name: t.tambon || t.tam_nameT || t.tam_name, // API uses tambon
            amp_code: t.amp_code,
          }));
          await app.$indexedDB.addTambons(mappedTambons);
          console.log(`✅ Saved ${mappedTambons.length} tambons`);
        }

        console.log("✅ Location data initialization completed");
      } catch (error) {
        console.error("❌ Location data initialization failed:", error);
        throw error;
      }
    }

    /**
     * ดึงข้อมูลที่อยู่จาก API
     */
    async fetchLocationData(url) {
      try {
        const response = await $axios.$get(url);
        if (response && response.results) {
          // Log sample data to help debug field names
          if (response.results.length > 0) {
            console.log(`📋 Sample data from ${url}:`, response.results[0]);
          }
          return response.results;
        }
        return [];
      } catch (error) {
        console.error(`Failed to fetch location data from ${url}:`, error);
        return [];
      }
    }

    /**
     * โหลดข้อมูลกิจกรรม
     */
    async initializeActivities() {
      try {
        console.log("📋 Initializing activities data...");

        // ตรวจสอบว่าข้อมูลล่าสุดอายุเกิน 1 ชั่วโมงหรือไม่
        const lastUpdate = await app.$indexedDB.getSetting(
          "activities_last_update"
        );
        const now = Date.now();

        if (lastUpdate && now - lastUpdate < this.ACTIVITIES_UPDATE_INTERVAL) {
          const activities = await app.$indexedDB.getActivities();
          console.log(
            `✅ Activities data is up to date (${activities.length} items)`
          );
          return;
        }

        // ดึงข้อมูลใหม่จาก API
        await this.updateActivitiesFromAPI();
      } catch (error) {
        console.error("❌ Activities initialization failed:", error);
      }
    }

    /**
     * บังคับอัพเดทข้อมูลกิจกรรม (ใช้สำหรับ debug)
     */
    async forceUpdateActivities() {
      console.log("🔄 Force updating activities...");
      await app.$indexedDB.setSetting("activities_last_update", 0);
      await this.updateActivitiesFromAPI();
    }

    /**
     * อัพเดทข้อมูลกิจกรรมจาก API
     */
    async updateActivitiesFromAPI() {
      try {
        console.log("🔄 Fetching activities from API...");

        const response = await $axios.$get(
          "/api/parenting2025_census/get/homevisit/getobjective.php"
        );

        if (response && response.results && response.results.length > 0) {
          console.log(
            `📥 Received ${response.results.length} activities from API`
          );

          // ตรวจสอบ sample data
          if (response.results.length > 0) {
            console.log("Sample activity:", response.results[0]);
          }

          // ล้างข้อมูลเก่า
          await app.$indexedDB.clearActivities();
          console.log("🗑️ Cleared old activities");

          // เพิ่มข้อมูลใหม่
          const result = await app.$indexedDB.addActivities(response.results);
          console.log(
            `💾 Inserted activities - Success: ${result.successCount}, Errors: ${result.errorCount}`
          );

          if (result.errorCount > 0) {
            console.warn(`⚠️ ${result.errorCount} activities failed to insert`);
          }

          // บันทึกเวลาที่อัพเดท
          await app.$indexedDB.setSetting("activities_last_update", Date.now());

          // ตรวจสอบจำนวนที่บันทึกจริง
          const savedActivities = await app.$indexedDB.getActivities();
          console.log(`✅ Total activities in DB: ${savedActivities.length}`);

          if (savedActivities.length !== response.results.length) {
            console.warn(
              `⚠️ Mismatch: API sent ${response.results.length}, but DB has ${savedActivities.length}`
            );
          }
        } else {
          console.warn("⚠️ No activities data received from API");
        }
      } catch (error) {
        console.error("❌ Failed to update activities:", error);
      }
    }

    /**
     * ตั้งค่า auto-update สำหรับกิจกรรม (ทุก 1 ชั่วโมง)
     */
    setupActivitiesAutoUpdate() {
      // ล้าง interval เดิมถ้ามี
      if (this.activitiesUpdateInterval) {
        clearInterval(this.activitiesUpdateInterval);
      }

      // ตั้ง interval ใหม่
      this.activitiesUpdateInterval = setInterval(() => {
        console.log("⏰ Auto-updating activities...");
        this.updateActivitiesFromAPI();
      }, this.ACTIVITIES_UPDATE_INTERVAL);

      console.log("✅ Activities auto-update enabled (1 hour interval)");
    }

    /**
     * ซิงค์ข้อมูลผู้รับบริการจาก API
     */
    async syncVisitors(username) {
      try {
        if (!navigator.onLine) {
          console.log("⚠️ Offline - skipping visitors sync");
          return false;
        }

        console.log(`🔄 Syncing visitors for ${username}...`);

        const response = await $axios.$get(
          `/api/parenting2025_census/get/homevisit/getchildsample.php?homevisitor=${username}`
        );

        if (!response || !response.results) {
          console.log("⚠️ No visitors data received");
          return false;
        }

        const apiVisitors = response.results;
        console.log(`📥 Received ${apiVisitors.length} visitors from API`);

        // ดึงข้อมูลผู้รับบริการที่มีในเครื่อง
        const localVisitors = await app.$indexedDB.getVisitors();
        const localVisitorsMap = new Map();
        localVisitors.forEach((v) => localVisitorsMap.set(v.stid, v));

        // สร้าง Set ของ stid จาก API เพื่อใช้ตรวจสอบรายการที่ถูกลบ
        const apiStidSet = new Set();
        apiVisitors.forEach((v) => apiStidSet.add(v.stid));

        let newCount = 0;
        let updatedCount = 0;
        let deletedCount = 0;

        // 1. Merge ข้อมูลจาก API (เพิ่ม/อัพเดท)
        for (const apiVisitor of apiVisitors) {
          const localVisitor = localVisitorsMap.get(apiVisitor.stid);

          if (!localVisitor) {
            // ข้อมูลใหม่จาก API
            await app.$indexedDB.addVisitor({
              ...apiVisitor,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });
            newCount++;
          } else if (localVisitor.dataSource === "local") {
            // มีข้อมูลในเครื่องที่แก้ไขแล้ว - merge โดยรักษาข้อมูลที่แก้ไขไว้
            const mergedVisitor = {
              ...apiVisitor, // ข้อมูล read-only จาก API
              // รักษาข้อมูลที่แก้ไขได้ในเครื่อง
              tel: localVisitor.tel || apiVisitor.tel,
              address: localVisitor.address || apiVisitor.address,
              latitude: localVisitor.latitude || apiVisitor.latitude,
              longitude: localVisitor.longitude || apiVisitor.longitude,
              prov_code: localVisitor.prov_code || apiVisitor.prov_code,
              amp_code: localVisitor.amp_code || apiVisitor.amp_code,
              tam_code: localVisitor.tam_code || apiVisitor.tam_code,
              dataSource: "local", // ยังคงเป็น local เพราะยังมีการแก้ไข
              lastSyncedAt: new Date().toISOString(),
            };
            await app.$indexedDB.updateVisitor(mergedVisitor);
            updatedCount++;
          } else {
            // ข้อมูลจาก API ปกติ - อัพเดททั้งหมด
            await app.$indexedDB.addVisitor({
              ...apiVisitor,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });
            updatedCount++;
          }
        }

        // 2. ลบรายการที่ API ไม่มีแล้ว
        // ตรวจสอบ visitors ที่มีใน IndexedDB แต่ไม่มีใน API
        for (const localVisitor of localVisitors) {
          // ตรวจสอบว่า visitor นี้เป็นของ username ที่กำลัง sync หรือไม่
          if (localVisitor.homevisitor !== username) {
            continue; // ข้ามรายการที่ไม่ใช่ของ username นี้
          }

          // ถ้า API ไม่มี stid นี้แล้ว และไม่ใช่ข้อมูลที่แก้ไขออฟไลน์
          if (!apiStidSet.has(localVisitor.stid)) {
            if (localVisitor.dataSource === "local") {
              // ข้อมูลที่แก้ไขออฟไลน์ - ไม่ลบ เก็บไว้ sync ก่อน
              console.log(
                `⚠️ Keeping local changes for deleted visitor: ${localVisitor.stid}`
              );
            } else {
              // ข้อมูลจาก API ที่ถูกลบแล้ว - ลบออกจาก IndexedDB
              await app.$indexedDB.deleteVisitor(localVisitor.stid);
              deletedCount++;
              console.log(`🗑️ Deleted visitor: ${localVisitor.stid}`);
            }
          }
        }

        // บันทึกเวลาที่ sync
        await app.$indexedDB.setSetting(
          "visitors_last_sync",
          new Date().toISOString()
        );

        console.log(
          `✅ Visitors sync completed: ${newCount} new, ${updatedCount} updated, ${deletedCount} deleted`
        );

        return true;
      } catch (error) {
        console.error("❌ Visitors sync failed:", error);
        return false;
      }
    }

    /**
     * ซิงค์ข้อมูลการนัดหมายจาก API
     * API Endpoint: get/homevisit/getchildsample_app.php
     * ดึงเฉพาะข้อมูลวันนัดหมาย โดยใช้ stid เป็น key
     */
    async syncBookings(username) {
      try {
        if (!navigator.onLine) {
          console.log("⚠️ Offline - skipping bookings sync");
          return false;
        }

        console.log(`🔄 Syncing bookings for ${username}...`);

        const response = await $axios.$get(
          `/api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}`
        );

        if (!response || !response.results) {
          console.log("⚠️ No bookings data received from API");
          return false;
        }

        const apiBookings = response.results;
        console.log(
          `📥 Received ${apiBookings.length} booking records from API`
        );

        // Log sample data เพื่อ debug (เฉพาะ record แรก)
        if (apiBookings.length > 0) {
          console.log("📋 Sample booking data:", {
            stid: apiBookings[0].stid,
            appointmentDate: apiBookings[0].date_app_curr,
            appointmentTime: apiBookings[0].time_app_curr,
            month_age: apiBookings[0].month_age,
            time: apiBookings[0].time,
            approve_status: apiBookings[0].approve_status,
            approve_date: apiBookings[0].approve_date,
          });
        }

        // อัพเดท approve_status จาก API getchildsample_app.php ไปยัง survey_progress
        for (const booking of apiBookings) {
          if (booking.stid && booking.time) {
            // ค้นหา survey_progress ด้วย stid และ time
            const allSurveys = await app.$indexedDB.getAllSurveysByStid(
              booking.stid
            );
            const existingSurvey = allSurveys.find(
              (s) => String(s.time) === String(booking.time)
            );

            if (
              existingSurvey &&
              booking.approve_status !== null &&
              booking.approve_status !== undefined
            ) {
              const parsedApproveStatus = parseInt(booking.approve_status) || 0;

              // อัพเดทเฉพาะ approve_status ถ้ามีการเปลี่ยนแปลง
              if (existingSurvey.approve_status !== parsedApproveStatus) {
                await app.$indexedDB.saveSurveyProgress({
                  ...existingSurvey,
                  approve_status: parsedApproveStatus,
                  lastUpdated: new Date().toISOString(),
                });
                console.log(
                  `✅ Updated approve_status from bookings API for ${booking.stid} (time: ${booking.time}) → ${parsedApproveStatus}`
                );
              }
            }
          }
        }

        // ดึงข้อมูลการนัดหมายที่มีในเครื่อง
        const localBookings = await app.$indexedDB.getBookings();
        const localBookingsMap = new Map();
        localBookings.forEach((b) => localBookingsMap.set(b.stid, b));

        let newCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        // Merge ข้อมูล
        for (const apiBooking of apiBookings) {
          // ตรวจสอบว่ามี stid (required field)
          if (!apiBooking.stid) {
            console.warn("⚠️ Skipping booking without stid:", apiBooking);
            skippedCount++;
            continue;
          }

          // ตรวจสอบว่า API ส่งข้อมูลนัดหมายมาหรือไม่
          if (!apiBooking.date_app_curr && !apiBooking.time_app_curr) {
            // ไม่มีข้อมูลนัดหมาย - ข้ามไป
            continue;
          }

          const localBooking = localBookingsMap.get(apiBooking.stid);

          if (!localBooking) {
            // ข้อมูลใหม่จาก API
            await app.$indexedDB.addBooking({
              stid: apiBooking.stid,
              appointmentDate: apiBooking.date_app_curr || null,
              appointmentTime: apiBooking.time_app_curr || null,
              month_age: apiBooking.month_age || null,
              time: apiBooking.time || null,
              cnt_app: apiBooking.cnt_app || 1,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });
            newCount++;
          } else if (localBooking.dataSource === "local") {
            // มีข้อมูลในเครื่องที่แก้ไขแล้ว - รักษาข้อมูลที่แก้ไขไว้
            // ไม่ต้อง overwrite เพราะเราจะ sync กลับไป API ในขั้นตอนถัดไป
            console.log(
              `⚠️ Keeping local changes for stid: ${apiBooking.stid}`
            );
            skippedCount++;
          } else {
            // ข้อมูลจาก API ปกติ - อัพเดททั้งหมด
            await app.$indexedDB.updateBooking({
              stid: apiBooking.stid,
              appointmentDate: apiBooking.date_app_curr || null,
              appointmentTime: apiBooking.time_app_curr || null,
              month_age: apiBooking.month_age || null,
              time: apiBooking.time || null,
              cnt_app: apiBooking.cnt_app || 1,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });
            updatedCount++;
          }
        }

        // บันทึกเวลาที่ sync
        await app.$indexedDB.setSetting(
          "bookings_last_sync",
          new Date().toISOString()
        );

        console.log(
          `✅ Bookings sync completed: ${newCount} new, ${updatedCount} updated, ${skippedCount} skipped`
        );

        return true;
      } catch (error) {
        console.error("❌ Bookings sync failed:", error);
        if (error.response) {
          console.error(
            "API Response:",
            error.response.status,
            error.response.data
          );
        }
        return false;
      }
    }

    /**
     * ซิงค์ข้อมูลผลการบันทึกเยี่ยมบ้านจาก API
     * API Endpoint: get/homevisit/getchildsample_result.php
     */
    async syncSurveyResults(username) {
      try {
        if (!navigator.onLine) {
          console.log("⚠️ Offline - skipping survey results sync");
          return false;
        }

        console.log(`🔄 Syncing survey results for ${username}...`);

        const response = await $axios.$get(
          `/api/parenting2025_census/get/homevisit/getchildsample_result.php?homevisitor=${username}`
        );

        if (!response || !response.results) {
          console.log("⚠️ No survey results data received from API");
          return false;
        }

        const apiResults = response.results;
        console.log(
          `📥 Received ${apiResults.length} survey result records from API`
        );

        // Log sample data
        if (apiResults.length > 0) {
          console.log("📋 Sample survey result data:", {
            stid: apiResults[0].stid,
            time: apiResults[0].time_visit,
            date_visit: apiResults[0].date_visit,
            timeupload: apiResults[0].timeupload,
            has_pic1: !!apiResults[0].pic1,
            has_pic2: !!apiResults[0].pic2,
          });
        }

        let newCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        // Process each result from API
        for (const result of apiResults) {
          try {
            // API ส่งมาเป็น time_visit แต่เราใช้ time ใน IndexedDB
            const timeValue = result.time_visit || result.time;

            // Skip if missing required fields
            if (!result.stid || !timeValue) {
              console.warn("⚠️ Skipping result without stid or time:", result);
              skippedCount++;
              continue;
            }

            // Generate survey ID (standard format)
            const surveyId = `${result.stid}_${timeValue}`;

            // Get existing local survey by standard ID
            let localSurvey = await app.$indexedDB.getSurveyProgressById(
              surveyId
            );

            // ตรวจสอบว่ามี survey อื่นที่มี stid + time เหมือนกันแต่ id ต่างกัน
            if (!localSurvey) {
              const allSurveys = await app.$indexedDB.getAll("survey_progress");
              const duplicateSurveys = allSurveys.filter(
                (s) =>
                  String(s.stid) === String(result.stid) &&
                  String(s.time) === String(timeValue) &&
                  s.id !== surveyId
              );

              if (duplicateSurveys.length > 0) {
                console.warn(
                  `⚠️ Found ${duplicateSurveys.length} surveys with different IDs for ${surveyId}`
                );

                // เลือก survey ที่ดีที่สุดเป็น localSurvey
                localSurvey = duplicateSurveys.reduce((best, current) => {
                  if (!best) return current;

                  // เลือกอันที่มีข้อมูลสมบูรณ์กว่า
                  const bestScore =
                    (best.completed ? 10 : 0) +
                    (best.synced ? 5 : 0) +
                    Object.keys(best.answers || {}).length;
                  const currentScore =
                    (current.completed ? 10 : 0) +
                    (current.synced ? 5 : 0) +
                    Object.keys(current.answers || {}).length;

                  return currentScore > bestScore ? current : best;
                }, null);

                // ลบ surveys ที่เป็น duplicate ทั้งหมด
                for (const dupSurvey of duplicateSurveys) {
                  try {
                    await app.$indexedDB.deleteSurveyProgress(dupSurvey.id);
                    console.log(
                      `🗑️ Removed duplicate survey with ID: ${dupSurvey.id}`
                    );
                  } catch (error) {
                    console.error(
                      `❌ Failed to remove duplicate ${dupSurvey.id}:`,
                      error
                    );
                  }
                }
              }
            }

            // Helper function: แปลง string เป็น array (e.g., "1,3,5" -> [1,3,5])
            const parseArrayFromString = (str) => {
              if (!str) return [];
              if (Array.isArray(str)) return str;
              return str
                .toString()
                .split(",")
                .map((v) => {
                  const num = parseInt(v.trim());
                  return isNaN(num) ? v.trim() : num;
                })
                .filter((v) => v !== "");
            };

            // Log sample data conversion
            if (result.q3 || result.q6 || result.q7) {
              console.log(
                `📥 Converting arrays for ${result.stid} (time: ${timeValue}):`,
                {
                  q3_raw: result.q3,
                  q3_parsed: parseArrayFromString(result.q3),
                  q6_raw: result.q6,
                  q6_parsed: parseArrayFromString(result.q6),
                  q7_raw: result.q7,
                  q7_parsed: parseArrayFromString(result.q7),
                }
              );
            }

            // Map q5 และ q9 โดยใช้ activity ID เป็น key
            const q5Answers = {};
            const q9Answers = {};

            // Map q5: q51_name เป็น key, q51 เป็น value
            if (result.q51_name && result.q51)
              q5Answers[result.q51_name] = result.q51;
            if (result.q52_name && result.q52)
              q5Answers[result.q52_name] = result.q52;
            if (result.q53_name && result.q53)
              q5Answers[result.q53_name] = result.q53;
            if (result.q54_name && result.q54)
              q5Answers[result.q54_name] = result.q54;
            if (result.q55_name && result.q55)
              q5Answers[result.q55_name] = result.q55;

            // Map q9: q91_name เป็น key, q91 เป็น value
            if (result.q91_name && result.q91)
              q9Answers[result.q91_name] = result.q91;
            if (result.q92_name && result.q92)
              q9Answers[result.q92_name] = result.q92;
            if (result.q93_name && result.q93)
              q9Answers[result.q93_name] = result.q93;
            if (result.q94_name && result.q94)
              q9Answers[result.q94_name] = result.q94;
            if (result.q95_name && result.q95)
              q9Answers[result.q95_name] = result.q95;

            console.log(`🔄 Mapped q5 and q9 for ${result.stid}:`, {
              q5_names: [
                result.q51_name,
                result.q52_name,
                result.q53_name,
                result.q54_name,
                result.q55_name,
              ].filter(Boolean),
              q5_answers: q5Answers,
              q9_names: [
                result.q91_name,
                result.q92_name,
                result.q93_name,
                result.q94_name,
                result.q95_name,
              ].filter(Boolean),
              q9_answers: q9Answers,
            });

            // Map API data to survey_progress structure
            // ⚠️ หมายเหตุ: API getchildsample_result.php ไม่มี approve_status
            // approve_status จะได้จาก API getchildsample_app.php แทน
            const apiSurveyData = {
              id: surveyId,
              stid: result.stid,
              time: String(timeValue), // Map จาก time_visit ของ API เป็น time
              month_age: result.month_age,
              timeStart: result.timeStart,
              timeEnd: result.timeEnd,
              appointmentDate: result.date_visit,
              fullname_visit: result.fullname_visit,
              answers: {
                q1: result.q1,
                q1_des: result.q1_des,
                q2: result.q2,
                q2_des: result.q2_des,
                // q3 จาก API เป็น string ต้อง convert เป็น array
                q3: parseArrayFromString(result.q3),
                q3_des: result.q3_des,
                q4: result.q4,
                // q5 ใช้ activity ID เป็น key (จาก q51_name, q52_name, ...)
                q5: q5Answers,
                // q6 จาก API เป็น string ต้อง convert เป็น array
                q6: parseArrayFromString(result.q6),
                q6_des: result.q6_des, // เก็บทั้งสอง q6_des และ q6_other
                q6_other: result.q6_des, // ใน IndexedDB ใช้ q6_other
                // q7 จาก API เป็น string ต้อง convert เป็น array
                q7: parseArrayFromString(result.q7),
                q71: result.q71,
                q71_des: result.q71_des,
                q8: result.q8,
                // q9 ใช้ activity ID เป็น key (จาก q91_name, q92_name, ...)
                q9: q9Answers,
                q10_appDate: result.q10_appDate,
                q10_appTime: result.q10_appTime,
                notes: result.note || "", // เพิ่ม notes ด้วยเพื่อให้ตรงกับ IndexedDB structure
              },
              surveyImages: [
                result.pic1
                  ? {
                      url: result.pic1,
                      base64: null, // Will be merged from local if exists
                      key: "pic1",
                    }
                  : null,
                result.pic2
                  ? {
                      url: result.pic2,
                      base64: null, // Will be merged from local if exists
                      key: "pic2",
                    }
                  : null,
                // pic3 ไม่ใช้งาน - ไม่เก็บ
              ].filter(Boolean),
              surveyImageKeys: [
                result.pic1 ? "pic1" : null,
                result.pic2 ? "pic2" : null,
                result.pic3 ? "pic3" : null,
              ].filter(Boolean),
              note: result.note,
              // ✅ ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่ก่อน set completed = true
              // ถ้ามีแค่วันนัดหมาย แต่ไม่มีคำตอบ (q1-q8) ถือว่ายัง completed = false
              completed: !!(
                result.q1 ||
                result.q2 ||
                result.q3 ||
                result.q4 ||
                result.q6 ||
                result.q7 ||
                result.q8
              ),
              synced: true,
              // ⚠️ ไม่ต้องเซ็ต approve_status จาก API นี้ เพราะ API getchildsample_result.php ไม่มีฟิลด์นี้
              // approve_status จะมาจาก API getchildsample_app.php ใน syncBookings() แทน
              approve_status: localSurvey?.approve_status || 0, // เก็บค่าเดิมจาก local
              timeupload: result.timeupload,
              lastUpdated: new Date().toISOString(),
            };

            // Merge with existing local images to preserve base64
            if (localSurvey && localSurvey.surveyImages) {
              apiSurveyData.surveyImages = apiSurveyData.surveyImages.map(
                (apiImg, index) => {
                  const localImg = localSurvey.surveyImages[index];
                  if (localImg && localImg.base64) {
                    return {
                      ...apiImg,
                      base64: localImg.base64, // Keep local base64 for offline support
                    };
                  }
                  return apiImg;
                }
              );
              console.log(
                `🔄 Merged base64 data from local for survey ${surveyId}`
              );
            }

            if (!localSurvey) {
              // ไม่มีข้อมูล local - สร้างใหม่จาก API
              await app.$indexedDB.saveSurveyProgress(apiSurveyData);
              newCount++;
              console.log(
                `✅ Created new survey result for stid: ${result.stid}, time: ${timeValue}`
              );
            } else if (localSurvey.synced === false) {
              // มีข้อมูล local ที่ยัง sync ไม่สำเร็จ - เก็บข้อมูล local ไว้ทั้งหมด
              // approve_status จะถูกอัพเดทจาก syncBookings() แทน
              console.log(
                `⚠️ Keeping all local data for stid: ${result.stid}, time: ${timeValue} (not synced yet)`
              );
              skippedCount++;
            } else {
              // มีข้อมูล local ที่ sync แล้ว - อัพเดททั้งหมดจาก API
              // (ยกเว้น approve_status ที่จะมาจาก syncBookings)
              await app.$indexedDB.saveSurveyProgress(apiSurveyData);
              updatedCount++;
              console.log(
                `✅ Updated survey result from API for stid: ${result.stid}, time: ${timeValue}`
              );
            }
          } catch (error) {
            console.error(
              `❌ Failed to process survey result for stid: ${result.stid}, time: ${timeValue}`,
              error
            );
            skippedCount++;
          }
        }

        // บันทึกเวลาที่ sync
        await app.$indexedDB.setSetting(
          "survey_results_last_sync",
          new Date().toISOString()
        );

        console.log(
          `✅ Survey results sync completed: ${newCount} new, ${updatedCount} updated, ${skippedCount} skipped`
        );

        // ทำความสะอาดข้อมูลซ้ำหลัง sync
        console.log("🧹 Cleaning up duplicate surveys...");
        const cleanupResult = await app.$indexedDB.cleanupDuplicateSurveys();
        console.log(
          `✅ Cleanup result: ${cleanupResult.merged} merged, ${cleanupResult.removed} removed`
        );

        return true;
      } catch (error) {
        console.error("❌ Survey results sync failed:", error);
        if (error.response) {
          console.error(
            "API Response:",
            error.response.status,
            error.response.data
          );
        }
        return false;
      }
    }

    /**
     * ส่งข้อมูลการนัดหมายที่แก้ไขออฟไลน์กลับไป API
     */
    async pushBookingsToAPI() {
      try {
        if (!navigator.onLine) {
          console.log("⚠️ Offline - skipping bookings push");
          return false;
        }

        // ดึงการนัดหมายที่แก้ไขออฟไลน์
        const unsyncedBookings = await app.$indexedDB.getUnsyncedBookings();

        if (unsyncedBookings.length === 0) {
          console.log("✅ No unsynced bookings to push");
          return true;
        }

        console.log(`🔄 Pushing ${unsyncedBookings.length} bookings to API...`);

        let successCount = 0;
        let errorCount = 0;

        // Get username
        const username = app.$offlineAuth?.getUser?.()?.username;

        // ส่งทีละรายการ
        for (const booking of unsyncedBookings) {
          try {
            // ดึงข้อมูล visitor เพื่อเอา fname, lname
            const visitor = await app.$indexedDB.getVisitor(booking.stid);

            // ดึงกิจกรรมตาม month_age และ time
            const activities =
              await app.$indexedDB.getActivityByMonthAgeAndTime(
                booking.month_age,
                booking.time
              );

            // สร้าง activity IDs
            const activityIds = [];
            for (let i = 0; i < 5; i++) {
              if (activities && activities[i]) {
                activityIds.push(activities[i].no || "");
              } else {
                activityIds.push("");
              }
            }

            // สร้าง recStart (MySQL format: YYYY-MM-DD HH:MM:SS)
            const now = new Date();
            const recStart = `${now.getFullYear()}-${String(
              now.getMonth() + 1
            ).padStart(2, "0")}-${String(now.getDate()).padStart(
              2,
              "0"
            )} ${String(now.getHours()).padStart(2, "0")}:${String(
              now.getMinutes()
            ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

            // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
            const checkResponse = await $axios.$get(
              "/api/parenting2025_census/get/homevisit/getchildsample_app.php",
              {
                params: {
                  homevisitor: username,
                  stid: booking.stid,
                  time: booking.time,
                },
              }
            );

            // ตรวจสอบว่ามีรายการที่ตรงกับ stid, time และ month_age หรือไม่
            const existingRecord = checkResponse?.results?.find(
              (record) =>
                record.stid === booking.stid &&
                String(record.time) === String(booking.time) &&
                String(record.month_age) === String(booking.month_age)
            );

            let syncedCntApp = 1; // ค่าเริ่มต้น

            if (existingRecord) {
              // แก้ไขนัดหมาย (เลื่อนนัด) - ใช้ PUT และเพิ่ม cnt_app
              const currentCntApp = parseInt(existingRecord.cnt_app) || 1;
              const newCntApp = currentCntApp + 1;
              syncedCntApp = newCntApp; // เก็บค่าที่จะ sync กลับ

              await $axios.$put(
                "/api/parenting2025_census/put/homevisit/putdata.php",
                {
                  variable: [
                    "time_app_curr",
                    "date_app_curr",
                    "cnt_app",
                    "month_age",
                    "time",
                    "q1_name",
                    "q2_name",
                    "q3_name",
                    "q4_name",
                    "q5_name",
                  ],
                  value: [
                    booking.appointmentTime,
                    booking.appointmentDate,
                    String(newCntApp),
                    booking.month_age,
                    booking.time,
                    activityIds[0],
                    activityIds[1],
                    activityIds[2],
                    activityIds[3],
                    activityIds[4],
                  ],
                  pk: ["stid", "time"],
                  pkval: [booking.stid, booking.time],
                  tb: "homevisitor_app",
                }
              );
            } else {
              // สร้างนัดหมายครั้งแรก - ใช้ POST (cnt_app = 1)
              syncedCntApp = 1; // ค่าที่จะ sync กลับ

              await $axios.$post(
                "/api/parenting2025_census/post/homevisit/datarecord1row.php",
                {
                  variable: [
                    "recby",
                    "stid",
                    "project",
                    "recStart",
                    "time",
                    "fname_ch",
                    "lname_ch",
                    "month_age",
                    "time",
                    "time_app_first",
                    "date_app_first",
                    "time_app_curr",
                    "date_app_curr",
                    "cnt_app",
                    "q1_name",
                    "q2_name",
                    "q3_name",
                    "q4_name",
                    "q5_name",
                  ],
                  value: [
                    username || "",
                    booking.stid,
                    "15",
                    recStart,
                    booking.time,
                    visitor?.fname || "",
                    visitor?.lname || "",
                    booking.month_age,
                    booking.appointmentTime,
                    booking.appointmentTime,
                    booking.appointmentDate,
                    booking.appointmentTime,
                    booking.appointmentDate,
                    "1",
                    activityIds[0],
                    activityIds[1],
                    activityIds[2],
                    activityIds[3],
                    activityIds[4],
                  ],
                  tb: "homevisitor_app",
                }
              );
            }

            // อัพเดทสถานะเป็น synced และ cnt_app
            await app.$indexedDB.updateBooking({
              ...booking,
              cnt_app: syncedCntApp,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });

            successCount++;
            console.log(`✅ Synced booking for stid: ${booking.stid}`);
          } catch (error) {
            errorCount++;
            console.error(
              `❌ Failed to sync booking for stid: ${booking.stid}`,
              error
            );
          }
        }

        console.log(
          `✅ Bookings push completed: ${successCount} success, ${errorCount} errors`
        );

        return errorCount === 0;
      } catch (error) {
        console.error("❌ Bookings push failed:", error);
        return false;
      }
    }

    /**
     * อัพโหลดรูปภาพ base64 ไป S3
     * @param {string} base64Image - รูปภาพในรูปแบบ base64
     * @returns {Promise<string|null>} URL ของรูปภาพบน S3 หรือ null ถ้าล้มเหลว
     */
    async uploadImageToS3(base64Image) {
      try {
        if (!base64Image || !base64Image.startsWith("data:image")) {
          return null;
        }

        console.log("📤 Uploading image to S3...");

        const response = await $axios.$post("/api/spa/s3upload.php", {
          image: base64Image,
        });

        if (response && response.url) {
          console.log(`✅ Image uploaded to S3: ${response.url}`);
          return response.url;
        }

        return null;
      } catch (error) {
        console.error("❌ Failed to upload image to S3:", error);
        throw error;
      }
    }

    /**
     * ส่งผลการทำแบบทดสอบที่ยังไม่ sync กลับไป API
     */
    async pushSurveyResultsToAPI() {
      try {
        if (!navigator.onLine) {
          console.log("⚠️ Offline - skipping survey results push");
          return false;
        }

        // ดึงแบบสอบถามที่เสร็จแล้วแต่ยังไม่ sync
        const unsyncedSurveys = await app.$indexedDB.getUnsyncedSurveys();

        if (unsyncedSurveys.length === 0) {
          console.log("✅ No unsynced survey results to push");
          return true;
        }

        console.log(
          `🔄 Pushing ${unsyncedSurveys.length} survey results to API...`
        );

        let successCount = 0;
        let errorCount = 0;

        // Get username
        const username = app.$offlineAuth?.getUser?.()?.username;

        // ส่งทีละรายการ
        for (const survey of unsyncedSurveys) {
          try {
            // ดึงข้อมูล visitor เพื่อเอา fname, lname
            const visitor = await app.$indexedDB.getVisitor(survey.stid);

            // ดึงกิจกรรมเพื่อเอา activity names
            const activities =
              await app.$indexedDB.getActivityByMonthAgeAndTime(
                survey.month_age,
                survey.time
              );

            // สร้าง activity names สำหรับ q5 (q51_name - q55_name)
            const q5ActivityNames = [];
            for (let i = 0; i < 5; i++) {
              if (activities && activities[i]) {
                q5ActivityNames.push(activities[i].no || "");
              } else {
                q5ActivityNames.push("");
              }
            }

            // สร้าง activity names สำหรับ q9 (q91_name - q95_name)
            // ใช้ชุดเดียวกับ q5
            const q9ActivityNames = [...q5ActivityNames];

            // Upload images to S3 first, then get URLs
            let pic1 = "";
            let pic2 = "";
            const pic3 = ""; // pic3 ไม่ใช้งาน - ส่งค่าว่าง

            try {
              // Process image 1
              if (survey.surveyImages?.[0]) {
                const img1 = survey.surveyImages[0];
                if (typeof img1 === "object" && img1.url) {
                  // Already has URL, use it
                  pic1 = img1.url;
                  console.log(`✅ Using existing URL for pic1: ${pic1}`);
                } else if (
                  (typeof img1 === "object" && img1.base64) ||
                  typeof img1 === "string"
                ) {
                  // Upload base64 to S3
                  const base64Data =
                    typeof img1 === "object" ? img1.base64 : img1;
                  console.log(`🔄 Uploading pic1 to S3...`);
                  const uploadedUrl = await this.uploadImageToS3(base64Data);
                  if (uploadedUrl) {
                    pic1 = uploadedUrl;
                    // Update survey with URL
                    survey.surveyImages[0] = {
                      base64: base64Data,
                      url: uploadedUrl,
                      key: "pic1",
                    };
                  } else {
                    throw new Error("ไม่สามารถอัพโหลดรูปภาพที่ 1 ไปยัง S3 ได้");
                  }
                }
              }

              // Process image 2
              if (survey.surveyImages?.[1]) {
                const img2 = survey.surveyImages[1];
                if (typeof img2 === "object" && img2.url) {
                  // Already has URL, use it
                  pic2 = img2.url;
                  console.log(`✅ Using existing URL for pic2: ${pic2}`);
                } else if (
                  (typeof img2 === "object" && img2.base64) ||
                  typeof img2 === "string"
                ) {
                  // Upload base64 to S3
                  const base64Data =
                    typeof img2 === "object" ? img2.base64 : img2;
                  console.log(`🔄 Uploading pic2 to S3...`);
                  const uploadedUrl = await this.uploadImageToS3(base64Data);
                  if (uploadedUrl) {
                    pic2 = uploadedUrl;
                    // Update survey with URL
                    survey.surveyImages[1] = {
                      base64: base64Data,
                      url: uploadedUrl,
                      key: "pic2",
                    };
                  } else {
                    throw new Error("ไม่สามารถอัพโหลดรูปภาพที่ 2 ไปยัง S3 ได้");
                  }
                }
              }

              // Update survey in IndexedDB with URLs
              await app.$indexedDB.saveSurveyProgress(survey);
              console.log(`✅ Updated survey ${survey.id} with S3 URLs`);
            } catch (error) {
              console.error(
                `❌ Failed to upload images for ${survey.stid}:`,
                error
              );
              errorCount++;

              // Show specific error to user via toast
              if (error.message && error.message.includes("อัพโหลดรูปภาพ")) {
                console.error(`🚨 Image upload error: ${error.message}`);
              }

              // Skip this survey and continue to next
              console.log(
                `⏭️ Skipping survey ${survey.stid} due to image upload failure`
              );
              continue;
            }

            // Log q5 และ q9 mapping
            console.log(`📤 Preparing q5 and q9 for API (${survey.stid}):`, {
              q5_activity_ids: q5ActivityNames,
              q5_values: q5ActivityNames.map((id) => survey.answers?.q5?.[id]),
              q5_object: survey.answers?.q5,
              q9_activity_ids: q9ActivityNames,
              q9_values: q9ActivityNames.map((id) => survey.answers?.q9?.[id]),
              q9_object: survey.answers?.q9,
            });

            // สร้าง payload
            const payload = {
              variable: [
                "recby",
                "stid",
                "project",
                "time",
                "recStart",
                "recEnd",
                "recStatus",
                "fname_ch",
                "lname_ch",
                "fullname_visit",
                "date_visit",
                "timeStart",
                "q1",
                "q1_des",
                "q2",
                "q2_des",
                "q3",
                "q3_des",
                "q4",
                "q51_name",
                "q52_name",
                "q53_name",
                "q54_name",
                "q55_name",
                "q51",
                "q52",
                "q53",
                "q54",
                "q55",
                "q6",
                "q6_des",
                "q7",
                "q71",
                "q71_des",
                "q8",
                "q91_name",
                "q92_name",
                "q93_name",
                "q94_name",
                "q95_name",
                "q91",
                "q92",
                "q93",
                "q94",
                "q95",
                "q10_appDate",
                "q10_appTime",
                "timeEnd",
                "note",
                "pic1",
                "pic2",
                "pic3",
              ],
              value: [
                username || "",
                survey.stid,
                "15",
                String(survey.time),
                survey.timeStart || "",
                survey.timeEnd || "",
                "1",
                visitor?.fname || "",
                visitor?.lname || "",
                survey.fullname_visit || "",
                survey.appointmentDate || "",
                survey.appointmentTime || "",
                String(survey.answers?.q1 || ""),
                survey.answers?.q1_des || "",
                String(survey.answers?.q2 || ""),
                survey.answers?.q2_des || "",
                // q3 เป็น array ต้อง convert เป็น string
                Array.isArray(survey.answers?.q3)
                  ? survey.answers.q3.join(",")
                  : String(survey.answers?.q3 || ""),
                survey.answers?.q3_des || "",
                String(survey.answers?.q4 || ""),
                q5ActivityNames[0],
                q5ActivityNames[1],
                q5ActivityNames[2],
                q5ActivityNames[3],
                q5ActivityNames[4],
                // q5 ใช้ activity ID เป็น key: survey.answers.q5[activityId]
                String(survey.answers?.q5?.[q5ActivityNames[0]] || ""),
                String(survey.answers?.q5?.[q5ActivityNames[1]] || ""),
                String(survey.answers?.q5?.[q5ActivityNames[2]] || ""),
                String(survey.answers?.q5?.[q5ActivityNames[3]] || ""),
                String(survey.answers?.q5?.[q5ActivityNames[4]] || ""),
                // q6 เป็น array ต้อง convert เป็น string
                Array.isArray(survey.answers?.q6)
                  ? survey.answers.q6.join(",")
                  : String(survey.answers?.q6 || ""),
                // q6_des ใน IndexedDB เป็น q6_other
                survey.answers?.q6_other || survey.answers?.q6_des || "",
                // q7 เป็น array ต้อง convert เป็น string
                Array.isArray(survey.answers?.q7)
                  ? survey.answers.q7.join(",")
                  : String(survey.answers?.q7 || ""),
                // q71 ไม่มี _des
                String(survey.answers?.q71 || ""),
                // q71_des ถ้ามี (จาก sync API กลับมา)
                survey.answers?.q71_des || "",
                String(survey.answers?.q8 || ""),
                q9ActivityNames[0],
                q9ActivityNames[1],
                q9ActivityNames[2],
                q9ActivityNames[3],
                q9ActivityNames[4],
                // q9 ใช้ activity ID เป็น key: survey.answers.q9[activityId]
                String(survey.answers?.q9?.[q9ActivityNames[0]] || ""),
                String(survey.answers?.q9?.[q9ActivityNames[1]] || ""),
                String(survey.answers?.q9?.[q9ActivityNames[2]] || ""),
                String(survey.answers?.q9?.[q9ActivityNames[3]] || ""),
                String(survey.answers?.q9?.[q9ActivityNames[4]] || ""),
                survey.answers?.q10_appDate || "",
                survey.answers?.q10_appTime || "",
                survey.timeEnd || "",
                // note ใน IndexedDB เป็น answers.notes หรือ survey.note
                survey.note || survey.answers?.notes || "",
                pic1,
                pic2,
                pic3,
              ],
              tb: "homevisitor_result",
            };

            // Log payload สำหรับ debug
            console.log(
              `📤 Sending survey result for ${survey.stid} (time: ${survey.time})`
            );
            console.log("📋 Payload sample:", {
              q3: payload.value[16], // q3
              q51_name: payload.value[19], // q51_name
              q52_name: payload.value[20], // q52_name
              q51: payload.value[24], // q51
              q52: payload.value[25], // q52
              q6: payload.value[29], // q6
              q6_des: payload.value[30], // q6_des
              q7: payload.value[31], // q7
              q71: payload.value[32], // q71
              q91_name: payload.value[35], // q91_name
              q92_name: payload.value[36], // q92_name
              q91: payload.value[40], // q91
              q92: payload.value[41], // q92
              note: payload.value[47], // note
            });

            // ส่งไป API
            await $axios.$post(
              "/api/parenting2025_census/post/homevisit/datarecord1row.php",
              payload
            );

            // อัพเดทสถานะเป็น synced
            await app.$indexedDB.updateSurveySyncStatus(survey.id, true, 0);

            successCount++;
            console.log(
              `✅ Synced survey result for stid: ${survey.stid}, time: ${survey.time}`
            );
          } catch (error) {
            errorCount++;
            console.error(
              `❌ Failed to sync survey result for stid: ${survey.stid}`,
              error
            );
          }
        }

        if (successCount > 0) {
          console.log(
            `✅ Survey results push completed: ${successCount} succeeded, ${errorCount} failed`
          );
        }

        return successCount > 0;
      } catch (error) {
        console.error("❌ Survey results push failed:", error);
        return false;
      }
    }

    /**
     * ทำความสะอาดเมื่อปิดหน้าเว็บ
     */
    cleanup() {
      if (this.activitiesUpdateInterval) {
        clearInterval(this.activitiesUpdateInterval);
        this.activitiesUpdateInterval = null;
      }
    }
  }

  // สร้าง instance
  const systemInit = new SystemInitManager();

  // Inject เข้า Vue instance
  inject("systemInit", systemInit);

  // ทำความสะอาดเมื่อปิดหน้า
  if (process.client) {
    window.addEventListener("beforeunload", () => {
      systemInit.cleanup();
    });
  }
}
