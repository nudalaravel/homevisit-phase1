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
            appointmentDate: apiBookings[0].appointmentDate,
            appointmentTime: apiBookings[0].appointmentTime,
          });
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
          if (!apiBooking.appointmentDate && !apiBooking.appointmentTime) {
            // ไม่มีข้อมูลนัดหมาย - ข้ามไป
            continue;
          }

          const localBooking = localBookingsMap.get(apiBooking.stid);

          if (!localBooking) {
            // ข้อมูลใหม่จาก API
            await app.$indexedDB.addBooking({
              stid: apiBooking.stid,
              appointmentDate: apiBooking.appointmentDate || null,
              appointmentTime: apiBooking.appointmentTime || null,
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
              appointmentDate: apiBooking.appointmentDate || null,
              appointmentTime: apiBooking.appointmentTime || null,
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

        // ส่งทีละรายการ
        for (const booking of unsyncedBookings) {
          try {
            const payload = {
              variable: [["appointmentDate", "appointmentTime"]],
              value: [
                [booking.appointmentDate || "", booking.appointmentTime || ""],
              ],
              pk: [["stid"]],
              pkval: [[booking.stid]],
              tb: "homevisitor_sample_students",
            };

            await $axios.$put(
              "/api/parenting2025_census/put/homevisit/putdata_arr.php",
              payload
            );

            // อัพเดทสถานะเป็น synced
            await app.$indexedDB.updateBooking({
              ...booking,
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
