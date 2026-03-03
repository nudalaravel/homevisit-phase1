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
      // Cache สำหรับ location data (optimization: ลด redundant API calls)
      this.locationDataCache = {
        provinces: null,
        amphoes: null,
        tambons: null,
        initialized: false,
      };
    }

    /**
     * เริ่มต้นระบบ - เรียกเมื่อเปิดหน้าเว็บ
     */
    async initialize() {
      if (this.isInitialized) return true;

      try {
        // 1. ตรวจสอบ IndexedDB
        const dbStatus = await this.validateIndexedDB();
        if (!dbStatus) {
          return false;
        }

        // 2. โหลดข้อมูลที่อยู่ (จังหวัด อำเภอ ตำบล)
        await this.initializeLocationData();

        // 3. โหลดข้อมูลกิจกรรม
        await this.initializeActivities();

        // 4. ตั้งค่า auto-update สำหรับกิจกรรม
        this.setupActivitiesAutoUpdate();

        // 5. Precache หน้า survey ใน background เพื่อให้ใช้งาน offline ได้ทันที
        this.precacheSurveyPage();

        this.isInitialized = true;

        return true;
      } catch (error) {
        return false;
      }
    }

    /**
     * ตรวจสอบว่า IndexedDB ทำงานปกติหรือไม่
     */
    async validateIndexedDB() {
      try {
        if (!app.$indexedDB) {
          return false;
        }

        // ลองเขียนและอ่านข้อมูลทดสอบ
        const testKey = "system_test";
        const testValue = { test: true, timestamp: Date.now() };

        await app.$indexedDB.setSetting(testKey, testValue);
        const readValue = await app.$indexedDB.getSetting(testKey);

        if (!readValue || readValue.test !== true) {
          return false;
        }

        return true;
      } catch (error) {
        return false;
      }
    }

    /**
     * โหลดข้อมูลที่อยู่ (จังหวัด อำเภอ ตำบล)
     */
    async initializeLocationData() {
      try {
        // ตรวจสอบ cache ก่อน (optimization: ลด redundant IndexedDB checks)
        if (this.locationDataCache.initialized) {
          return;
        }

        // ตรวจสอบว่ามีข้อมูลแล้วหรือไม่
        const provinces = await app.$indexedDB.getProvinces();

        if (provinces && provinces.length > 0) {
          // Mark cache as initialized
          this.locationDataCache.initialized = true;
          return;
        }

        // ถ้าไม่มีข้อมูลใน IndexedDB และ offline ให้ข้ามการดึงข้อมูล
        // (ข้อมูลจะถูกดึงเมื่อ online ครั้งถัดไป)
        if (!store.state.isOnline) {
          this.locationDataCache.initialized = true;
          return;
        }

        // ถ้าไม่มีข้อมูล หรือข้อมูลเสีย ให้ลบและดึงใหม่ (เมื่อ online)
        await app.$indexedDB.clearAllLocationData();

        // ดึงข้อมูล location ทั้ง 3 ชนิดแบบ parallel (optimization: API calls เป็น independent)
        const [provincesData, amphoesData, tambonsData] = await Promise.all([
          this.fetchLocationData("/api/parenting2025_census/get/homevisit/getprovince.php"),
          this.fetchLocationData("/api/parenting2025_census/get/homevisit/getamphoe.php"),
          this.fetchLocationData("/api/parenting2025_census/get/homevisit/gettambon.php"),
        ]);

        // Process และบันทึกข้อมูล (logic เดิม)
        if (provincesData && provincesData.length > 0) {
          // Map field names to match IndexedDB schema
          const mappedProvinces = provincesData.map((p) => ({
            prov_code: p.prov_code,
            prov_name: p.province || p.prov_nameT || p.prov_name, // API may use province, prov_nameT, or prov_name
          }));
          await app.$indexedDB.addProvinces(mappedProvinces);
        }

        if (amphoesData && amphoesData.length > 0) {
          // Map field names to match IndexedDB schema
          const mappedAmphoes = amphoesData.map((a) => ({
            amp_code: a.amp_code,
            amp_name: a.amphoe || a.amp_nameT || a.amp_name, // API may use amphoe, amp_nameT, or amp_name
            prov_code: a.prov_code,
          }));
          await app.$indexedDB.addAmphoes(mappedAmphoes);
        }

        if (tambonsData && tambonsData.length > 0) {
          // Map field names to match IndexedDB schema
          const mappedTambons = tambonsData.map((t) => ({
            tam_code: t.tambon_code || t.tam_code, // API uses tambon_code
            tam_name: t.tambon || t.tam_nameT || t.tam_name, // API uses tambon
            amp_code: t.amp_code,
          }));
          await app.$indexedDB.addTambons(mappedTambons);
        }

        // Mark cache as initialized after successful fetch
        this.locationDataCache.initialized = true;
      } catch (error) {
        // ถ้า offline และเกิด error ให้ข้าม (ไม่ throw error)
        if (!store.state.isOnline) {
          console.warn("Offline mode: Location data initialization skipped due to error:", error);
          this.locationDataCache.initialized = true;
          return;
        }
        throw error;
      }
    }

    /**
     * ดึงข้อมูลที่อยู่จาก API
     */
    async fetchLocationData(url) {
      try {
        // ตรวจสอบสถานะ offline ก่อนเรียก API
        if (!store.state.isOnline) {
          console.warn("Offline mode: Cannot fetch location data from API");
          return [];
        }

        const response = await $axios.$get(url);
        if (response && response.results) {
          return response.results;
        }
        return [];
      } catch (error) {
        // ถ้า offline ให้ return array ว่าง (ไม่ throw error)
        if (!store.state.isOnline) {
          console.warn("Offline mode: Location data fetch failed:", error);
          return [];
        }
        return [];
      }
    }

    /**
     * โหลดข้อมูลกิจกรรม
     */
    async initializeActivities() {
      try {
        // ตรวจสอบว่าข้อมูลล่าสุดอายุเกิน 1 ชั่วโมงหรือไม่
        const lastUpdate = await app.$indexedDB.getSetting("activities_last_update");
        const now = Date.now();

        if (lastUpdate && now - lastUpdate < this.ACTIVITIES_UPDATE_INTERVAL) {
          return;
        }

        // ตรวจสอบว่ามี activities ใน IndexedDB หรือไม่
        const existingActivities = await app.$indexedDB.getActivities();

        // ถ้า offline และมีข้อมูลอยู่แล้ว ให้ใช้ข้อมูลเดิม (ไม่ต้องอัพเดท)
        if (!store.state.isOnline && existingActivities && existingActivities.length > 0) {
          console.log("Offline mode: Using existing activities data");
          return;
        }

        // ถ้า offline และไม่มีข้อมูล ให้ข้ามการดึงข้อมูล
        if (!store.state.isOnline) {
          console.warn("Offline mode: Cannot fetch activities. No cached data available.");
          return;
        }

        // ดึงข้อมูลใหม่จาก API (เมื่อ online)
        await this.updateActivitiesFromAPI();
      } catch (error) {
        // Handle error silently
        console.warn("initializeActivities error:", error);
      }
    }

    /**
     * บังคับอัพเดทข้อมูลกิจกรรม
     */
    async forceUpdateActivities() {
      await app.$indexedDB.setSetting("activities_last_update", 0);
      await this.updateActivitiesFromAPI();
    }

    /**
     * อัพเดทข้อมูลกิจกรรมจาก API
     */
    async updateActivitiesFromAPI() {
      try {
        // ตรวจสอบสถานะ offline ก่อนเรียก API
        if (!store.state.isOnline) {
          console.warn("Offline mode: Cannot update activities from API");
          return false;
        }

        const response = await $axios.$get(
          "/api/parenting2025_census/get/homevisit/getobjective.php"
        );

        if (response && response.results && response.results.length > 0) {
          // ล้างข้อมูลเก่า
          await app.$indexedDB.clearActivities();

          // เพิ่มข้อมูลใหม่
          await app.$indexedDB.addActivities(response.results);

          // บันทึกเวลาที่อัพเดท
          await app.$indexedDB.setSetting("activities_last_update", Date.now());
          return true;
        }
        return false;
      } catch (error) {
        // Handle error silently
        console.warn("updateActivitiesFromAPI error:", error);
        return false;
      }
    }

    /**
     * Precache หน้า survey ใน background เพื่อให้ใช้งาน offline ได้ทันที
     * วิธีนี้จะ fetch หน้า survey ผ่าน router เพื่อให้ service worker cache อัตโนมัติ
     */
    async precacheSurveyPage() {
      // ใช้ setTimeout เพื่อไม่ให้บล็อกการ init
      setTimeout(async () => {
        try {
          // ตรวจสอบว่า service worker พร้อมหรือไม่
          if (!("serviceWorker" in navigator)) {
            return;
          }

          // รอให้ service worker พร้อม
          let swReady = false;
          if (navigator.serviceWorker.controller) {
            swReady = true;
          } else {
            try {
              await navigator.serviceWorker.ready;
              swReady = true;
            } catch (error) {
              console.log("Service worker not ready for survey precache");
              return;
            }
          }

          if (!swReady) return;

          // ใช้ router base จาก app หรือ window.location
          const routerBase =
            app.router?.base ||
            window.location.pathname.split("/").slice(0, -1).join("/") + "/" ||
            "/homevisit/";

          // Fetch หน้า survey โดยใช้ router เพื่อให้ service worker cache
          // เนื่องจากใช้ hash mode routing ต้องใช้ router.push เพื่อให้ Vue router จัดการ
          // แต่เราต้องการให้ service worker cache ดังนั้นจะ fetch base URL แล้วใช้ router
          try {
            // วิธีที่ 1: Fetch base URL เพื่อให้ service worker cache
            await fetch(routerBase, {
              method: "GET",
              cache: "default",
              mode: "same-origin",
            });

            // วิธีที่ 2: ใช้ router.push เพื่อให้ Vue router โหลดหน้า survey
            // แต่ไม่แสดงผล (silent navigation)
            if (app.router) {
              // สร้าง iframe ซ่อนไว้เพื่อโหลดหน้า survey
              const iframe = document.createElement("iframe");
              iframe.style.display = "none";
              iframe.style.width = "0";
              iframe.style.height = "0";
              iframe.src = `${routerBase}#/survey`;
              document.body.appendChild(iframe);

              // ลบ iframe หลังจากโหลดเสร็จ (รอ 3 วินาที)
              setTimeout(() => {
                if (iframe.parentNode) {
                  iframe.parentNode.removeChild(iframe);
                }
              }, 3000);
            }
          } catch (error) {
            // Ignore errors - ไม่ critical
            console.log("Survey page precache attempt:", error.message);
          }
        } catch (error) {
          // Ignore errors - ไม่ critical
          console.log("Survey page precache failed:", error.message);
        }
      }, 2000); // รอ 2 วินาทีหลัง init เสร็จเพื่อให้ service worker พร้อม
    }

    /**
     * ตั้งค่า auto-update สำหรับกิจกรรม (ทุก 1 ชั่วโมง)
     */
    setupActivitiesAutoUpdate() {
      // ล้าง interval เดิมถ้ามี
      if (this.activitiesUpdateInterval) {
        clearInterval(this.activitiesUpdateInterval);
      }

      // ตั้ง interval ใหม่ (ตรวจสอบสถานะ offline ก่อนอัพเดท)
      this.activitiesUpdateInterval = setInterval(() => {
        // ตรวจสอบสถานะ offline ก่อนเรียก API
        if (store.state.isOnline) {
          this.updateActivitiesFromAPI();
        }
      }, this.ACTIVITIES_UPDATE_INTERVAL);
    }

    /**
     * ซิงค์ข้อมูลผู้รับบริการจาก API
     */
    async syncVisitors(username) {
      try {
        // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
        if (!store.state.isOnline) {
          return false;
        }

        const response = await $axios.$get(
          `/api/parenting2025_census/get/homevisit/getchildsample.php?homevisitor=${username}`
        );

        if (!response || !response.results) {
          return false;
        }

        const apiVisitors = response.results;

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
            } else {
              // ข้อมูลจาก API ที่ถูกลบแล้ว - ลบออกจาก IndexedDB
              await app.$indexedDB.deleteVisitor(localVisitor.stid);
              deletedCount++;
            }
          }
        }

        // บันทึกเวลาที่ sync
        await app.$indexedDB.setSetting("visitors_last_sync", new Date().toISOString());

        return true;
      } catch (error) {
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
        // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
        if (!store.state.isOnline) {
          return false;
        }

        // ตรวจสอบว่า IndexedDB พร้อมใช้งาน
        const dbReady = await app.$indexedDB.ensureInitialized();
        if (!dbReady) {
          console.warn("IndexedDB not ready, skipping bookings sync");
          return false;
        }

        const response = await $axios.$get(
          `/api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}`
        );

        if (!response || !response.results) {
          return false;
        }

        const apiBookings = response.results;

        // อัพเดท approve_status จาก API getchildsample_app.php ไปยัง survey_progress
        console.log('[DEBUG syncBookings] Total bookings from API:', apiBookings.length);
        
        for (const booking of apiBookings) {
          if (booking.stid && booking.time_visit) {
            // ค้นหา survey_progress ด้วย stid และ time_visit
            const allSurveys = await app.$indexedDB.getAllSurveysByStid(booking.stid);
            const existingSurvey = allSurveys.find(
              (s) => String(s.time_visit) === String(booking.time_visit)
            );

            console.log('[DEBUG syncBookings] Checking booking:', {
              stid: booking.stid,
              time_visit: booking.time_visit,
              approve_status: booking.approve_status,
              approve_comment: booking.approve_comment,
              existingSurveyFound: !!existingSurvey,
              existingSurveyId: existingSurvey?.id
            });

            // อัพเดท approve_status และ approve_comment จาก API
            if (existingSurvey) {
              const parsedApproveStatus = booking.approve_status !== null && booking.approve_status !== undefined 
                ? parseInt(booking.approve_status) 
                : existingSurvey.approve_status || 0;
              // ใช้ field approve_comment จาก API โดยตรง
              const approveComment = booking.approve_comment || null;

              console.log('[DEBUG syncBookings] Comparing values:', {
                stid: booking.stid,
                time_visit: booking.time_visit,
                existingApproveStatus: existingSurvey.approve_status,
                newApproveStatus: parsedApproveStatus,
                existingApproveComment: existingSurvey.approve_comment,
                newApproveComment: approveComment,
                needsUpdate: existingSurvey.approve_status !== parsedApproveStatus || existingSurvey.approve_comment !== approveComment
              });

              // อัพเดท approve_status และ approve_comment ถ้ามีการเปลี่ยนแปลง
              if (
                existingSurvey.approve_status !== parsedApproveStatus ||
                existingSurvey.approve_comment !== approveComment
              ) {
                console.log('[DEBUG syncBookings] Updating survey_progress with approve_comment:', approveComment);
                await app.$indexedDB.saveSurveyProgress({
                  ...existingSurvey,
                  approve_status: parsedApproveStatus,
                  approve_comment: approveComment,
                  lastUpdated: new Date().toISOString(),
                });
                console.log('[DEBUG syncBookings] Survey updated successfully!');
              }
            } else {
              console.log('[DEBUG syncBookings] No existing survey found for:', booking.stid, booking.time_visit);
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
            skippedCount++;
            continue;
          }

          // ตรวจสอบว่า API ส่งข้อมูลนัดหมายมาหรือไม่
          if (!apiBooking.date_app_curr && !apiBooking.time_app_curr) {
            // ไม่มีข้อมูลนัดหมาย - ข้ามไป
            continue;
          }

          const localBooking = localBookingsMap.get(apiBooking.stid);

          // Helper function: ตรวจสอบว่าค่าจาก API ถูกต้องหรือไม่ (ไม่ใช่ null, undefined, empty string)
          const isValidValue = (value) => {
            return value !== null && value !== undefined && value !== "";
          };

          if (!localBooking) {
            // ข้อมูลใหม่จาก API
            await app.$indexedDB.addBooking({
              stid: apiBooking.stid,
              appointmentDate: apiBooking.date_app_curr || null,
              appointmentTime: apiBooking.time_app_curr || null,
              // ใช้ค่าจาก API ถ้ามี ถ้าไม่มีให้เป็น null
              month_age: isValidValue(apiBooking.month_age) ? apiBooking.month_age : null,
              time: isValidValue(apiBooking.time) ? apiBooking.time : null,
              time_visit: apiBooking.time_visit || null,
              cnt_app: apiBooking.cnt_app || 1,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });
            newCount++;
          } else if (localBooking.dataSource === "local") {
            // มีข้อมูลในเครื่องที่แก้ไขแล้ว - รักษาข้อมูลที่แก้ไขไว้
            // ไม่ต้อง overwrite เพราะเราจะ sync กลับไป API ในขั้นตอนถัดไป
            skippedCount++;
          } else {
            // ข้อมูลจาก API ปกติ - อัพเดททั้งหมด
            // ⚠️ สำคัญ: ถ้า API ไม่ส่ง month_age หรือ time มา ให้ใช้ค่าจาก local booking เดิม
            await app.$indexedDB.updateBooking({
              stid: apiBooking.stid,
              appointmentDate: apiBooking.date_app_curr || localBooking.appointmentDate || null,
              appointmentTime: apiBooking.time_app_curr || localBooking.appointmentTime || null,
              // ใช้ค่าจาก API ถ้ามี ถ้าไม่มีให้ใช้ค่าจาก local booking เดิม
              month_age: isValidValue(apiBooking.month_age)
                ? apiBooking.month_age
                : localBooking.month_age || null,
              time: isValidValue(apiBooking.time) ? apiBooking.time : localBooking.time || null,
              time_visit: apiBooking.time_visit || localBooking.time_visit || null,
              cnt_app: apiBooking.cnt_app || localBooking.cnt_app || 1,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });
            updatedCount++;
          }
        }

        // บันทึกเวลาที่ sync
        await app.$indexedDB.setSetting("bookings_last_sync", new Date().toISOString());

        return true;
      } catch (error) {
        console.error("Bookings sync failed:", error);
        if (error.response) {
          console.error("API Response:", error.response.status, error.response.data);
        }
        return false;
      }
    }

    /**
     * ซิงค์ approve_status และ approve_comment จาก API getchildsample_app.php
     * ต้องรันหลัง syncSurveyResults เพื่อไม่ให้ข้อมูลถูกเขียนทับ
     */
    async syncApprovalStatus(username) {
      try {
        // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
        if (!store.state.isOnline) {
          return false;
        }

        // ตรวจสอบว่า IndexedDB พร้อมใช้งาน
        const dbReady = await app.$indexedDB.ensureInitialized();
        if (!dbReady) {
          console.warn("IndexedDB not ready, skipping approval status sync");
          return false;
        }

        const response = await $axios.$get(
          `/api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}`
        );

        if (!response || !response.results) {
          console.log('[syncApprovalStatus] No results from API');
          return false;
        }

        const apiBookings = response.results;
        console.log('[syncApprovalStatus] Total bookings from API:', apiBookings.length);

        let updatedCount = 0;

        for (const booking of apiBookings) {
          if (booking.stid && booking.time_visit) {
            // ค้นหา survey_progress ด้วย stid และ time_visit
            const allSurveys = await app.$indexedDB.getAllSurveysByStid(booking.stid);
            const existingSurvey = allSurveys.find(
              (s) => String(s.time_visit) === String(booking.time_visit)
            );

            console.log('[syncApprovalStatus] Checking:', {
              stid: booking.stid,
              time_visit: booking.time_visit,
              approve_status: booking.approve_status,
              approve_comment: booking.approve_comment,
              surveyFound: !!existingSurvey
            });

            if (existingSurvey) {
              const parsedApproveStatus = booking.approve_status !== null && booking.approve_status !== undefined 
                ? parseInt(booking.approve_status) 
                : existingSurvey.approve_status || 0;
              const approveComment = booking.approve_comment || null;

              // อัพเดทถ้ามีการเปลี่ยนแปลง
              if (
                existingSurvey.approve_status !== parsedApproveStatus ||
                existingSurvey.approve_comment !== approveComment
              ) {
                console.log('[syncApprovalStatus] Updating survey:', {
                  id: existingSurvey.id,
                  oldStatus: existingSurvey.approve_status,
                  newStatus: parsedApproveStatus,
                  oldComment: existingSurvey.approve_comment,
                  newComment: approveComment
                });

                await app.$indexedDB.saveSurveyProgress({
                  ...existingSurvey,
                  approve_status: parsedApproveStatus,
                  approve_comment: approveComment,
                  lastUpdated: new Date().toISOString(),
                });
                updatedCount++;
              }
            }
          }
        }

        console.log('[syncApprovalStatus] Updated', updatedCount, 'surveys');
        return true;
      } catch (error) {
        console.error("Approval status sync failed:", error);
        return false;
      }
    }

    /**
     * ซิงค์ข้อมูลผลการบันทึกเยี่ยมบ้านจาก API
     * API Endpoint: get/homevisit/getchildsample_result.php
     */
    async syncSurveyResults(username) {
      try {
        // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
        if (!store.state.isOnline) {
          return false;
        }

        // ตรวจสอบว่า IndexedDB พร้อมใช้งาน
        const dbReady = await app.$indexedDB.ensureInitialized();
        if (!dbReady) {
          console.warn("IndexedDB not ready, skipping sync");
          return false;
        }

        const response = await $axios.$get(
          `/api/parenting2025_census/get/homevisit/getchildsample_result.php?homevisitor=${username}`
        );

        if (!response || !response.results) {
          return false;
        }

        const apiResults = response.results;

        let newCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        // Process each result from API
        for (const result of apiResults) {
          try {
            // API ส่งมาเป็น time และเราก็เก็บด้วย key time ใน IndexedDB (local variable ใช้ชื่อ timeActivity)
            // บางข้อมูลอาจมีแค่ time_visit แต่ไม่มี time (ข้อมูลเก่า)
            const timeValue = result.time_visit;
            const timeVisitValue = result.time_visit || null;

            // Skip if missing required fields
            // ถ้า time_visit เป็น empty string ("") ให้ถือว่าเป็นข้อมูลผิดพลาด - skip
            if (!result.stid) {
              console.warn("Skipping result without stid:", result);
              skippedCount++;
              continue;
            }

            // ตรวจสอบ time_visit - ถ้าเป็น empty string หรือ null แสดงว่าข้อมูลไม่สมบูรณ์
            if (!timeVisitValue || timeVisitValue === "") {
              console.warn("Skipping result with invalid time_visit:", {
                stid: result.stid,
                time_visit: result.time_visit,
                time: result.time,
                month_age: result.month_age,
              });
              skippedCount++;
              continue;
            }

            // ตรวจสอบ time - ถ้าไม่มีให้ใช้ค่า default เป็น null (อนุญาตให้เป็น null ได้)
            const finalTimeValue = timeValue || null;

            // Generate survey ID (standard format) - ใช้ time_visit เป็น unique key
            const surveyId = `${result.stid}_${timeVisitValue}`;

            // Get existing local survey by standard ID
            let localSurvey = await app.$indexedDB.getSurveyProgressById(surveyId);

            // ตรวจสอบว่ามี survey อื่นที่มี stid + time_visit เหมือนกันแต่ id ต่างกัน
            if (!localSurvey) {
              const allSurveys = await app.$indexedDB.getAll("survey_progress");
              const duplicateSurveys = allSurveys.filter(
                (s) =>
                  String(s.stid) === String(result.stid) &&
                  String(s.time_visit) === String(timeVisitValue) &&
                  s.id !== surveyId
              );

              if (duplicateSurveys.length > 0) {
                console.warn(
                  `Found ${duplicateSurveys.length} surveys with different IDs for ${surveyId}`
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
                  } catch (error) {
                    console.error(`Failed to remove duplicate ${dupSurvey.id}:`, error);
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

            // Helper function: Merge array keeping unique values from both local and API
            const mergeArrays = (localArray, apiArray) => {
              const local = Array.isArray(localArray) ? localArray : [];
              const api = Array.isArray(apiArray) ? apiArray : [];
              // Combine both arrays and keep unique values
              const combined = [...new Set([...local, ...api])];
              return combined.sort((a, b) => Number(a) - Number(b));
            };

            // Map q5 และ q9 โดยใช้ activity ID เป็น key
            // ถ้า q2=3, q5x_name และ q9x_name จะมีค่าแต่ q5x และ q9x จะเป็น empty string
            // ต้องเก็บเป็น null ในกรณีนี้
            const q5Answers = {};
            const q9Answers = {};

            // Map q5: q51_name เป็น key, q51 เป็น value
            // ถ้า q5x_name มีค่า แต่ q5x เป็น empty string หรือ null ให้เก็บเป็น null (กรณี q2=3)
            // ถ้า q5x_name มีค่า และ q5x มีค่า ให้เก็บเป็น Number(q5x)
            if (result.q51_name && result.q51_name !== "") {
              q5Answers[result.q51_name] =
                result.q51 && result.q51 !== "" ? Number(result.q51) : null;
            }
            if (result.q52_name && result.q52_name !== "") {
              q5Answers[result.q52_name] =
                result.q52 && result.q52 !== "" ? Number(result.q52) : null;
            }
            if (result.q53_name && result.q53_name !== "") {
              q5Answers[result.q53_name] =
                result.q53 && result.q53 !== "" ? Number(result.q53) : null;
            }
            if (result.q54_name && result.q54_name !== "") {
              q5Answers[result.q54_name] =
                result.q54 && result.q54 !== "" ? Number(result.q54) : null;
            }
            if (result.q55_name && result.q55_name !== "") {
              q5Answers[result.q55_name] =
                result.q55 && result.q55 !== "" ? Number(result.q55) : null;
            }

            // Map q9: q91_name เป็น key, q91 เป็น value
            // ถ้า q9x_name มีค่า แต่ q9x เป็น empty string หรือ null ให้เก็บเป็น null (กรณี q2=3)
            // ถ้า q9x_name มีค่า และ q9x มีค่า ให้เก็บเป็น Number(q9x)
            if (result.q91_name && result.q91_name !== "") {
              q9Answers[result.q91_name] =
                result.q91 && result.q91 !== "" ? Number(result.q91) : null;
            }
            if (result.q92_name && result.q92_name !== "") {
              q9Answers[result.q92_name] =
                result.q92 && result.q92 !== "" ? Number(result.q92) : null;
            }
            if (result.q93_name && result.q93_name !== "") {
              q9Answers[result.q93_name] =
                result.q93 && result.q93 !== "" ? Number(result.q93) : null;
            }
            if (result.q94_name && result.q94_name !== "") {
              q9Answers[result.q94_name] =
                result.q94 && result.q94 !== "" ? Number(result.q94) : null;
            }
            if (result.q95_name && result.q95_name !== "") {
              q9Answers[result.q95_name] =
                result.q95 && result.q95 !== "" ? Number(result.q95) : null;
            }

            // Map API data to survey_progress structure
            // หมายเหตุ: API getchildsample_result.php ไม่มี approve_status
            // approve_status จะได้จาก API getchildsample_app.php แทน

            // สร้าง fullname_visit จาก fname_ch และ lname_ch ถ้ายังไม่มี
            let fullnameVisit = result.fullname_visit;
            if (!fullnameVisit) {
              const fname = result.fname_ch || "";
              const lname = result.lname_ch || "";
              fullnameVisit = fname && lname ? `${fname} ${lname}` : fname || lname || "";
            }

            const apiSurveyData = {
              id: surveyId,
              stid: result.stid,
              time: String(timeValue), // Map จาก time ของ API เป็น time
              time_visit: result.time_visit || null,
              // ใช้ค่าจาก local ก่อน เพราะ user อาจแก้ไขล่าสุด
              month_age: localSurvey?.month_age || result.month_age,
              timeStart: result.timeStart,
              timeEnd: result.timeEnd,
              // ใช้ค่าจาก local ก่อน เพราะ user อาจแก้ไขล่าสุด
              appointmentDate: localSurvey?.appointmentDate || result.date_visit,
              fullname_visit: fullnameVisit,
              answers: {
                // Convert to number for consistent type (API returns string)
                q1: result.q1 != null ? Number(result.q1) : null,
                q1_des: result.q1_des || "",
                q2: result.q2 != null ? Number(result.q2) : null,
                q2_des: result.q2_des || "",
                // q3 จาก API เป็น string ต้อง convert เป็น array of numbers
                // Merge กับ local เพื่อเก็บค่าที่ user เลือกไว้ล่าสุด (เช่น 13)
                q3: mergeArrays(localSurvey?.answers?.q3, parseArrayFromString(result.q3)),
                q3_des: localSurvey?.answers?.q3_des || result.q3_des || "",
                q4: result.q4 != null ? Number(result.q4) : null,
                // q5 ใช้ activity ID เป็น key (จาก q51_name, q52_name, ...)
                q5: q5Answers,
                // q6 เป็น single value (ไม่ใช่ array แล้ว)
                // ใช้ค่าจาก local ถ้ามี ไม่งั้นใช้ค่าจาก API
                q6:
                  localSurvey?.answers?.q6 != null
                    ? localSurvey.answers.q6
                    : result.q6 != null
                    ? Number(result.q6)
                    : null,
                q6_des:
                  localSurvey?.answers?.q6_other ||
                  localSurvey?.answers?.q6_des ||
                  result.q6_des ||
                  "", // เก็บทั้งสอง q6_des และ q6_other
                q6_other:
                  localSurvey?.answers?.q6_other ||
                  localSurvey?.answers?.q6_des ||
                  result.q6_des ||
                  "", // ใน IndexedDB ใช้ q6_other
                // q7 เป็น single value (1 = มี, 0 = ไม่มี)
                q7: result.q7 != null ? Number(result.q7) : null,
                // q71 จาก API เป็น string ต้อง convert เป็น array of numbers
                // Merge กับ local เพื่อเก็บค่าที่ user เลือกไว้ล่าสุด (เช่น 13)
                q71: mergeArrays(localSurvey?.answers?.q71, parseArrayFromString(result.q71)),
                q71_des: localSurvey?.answers?.q71_des || result.q71_des || "",
                q8: result.q8 != null ? Number(result.q8) : null,
                // q9 ใช้ activity ID เป็น key (จาก q91_name, q92_name, ...)
                q9: q9Answers,
                q10_appDate: result.q10_appDate || "",
                q10_appTime: result.q10_appTime || "",
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
              // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่ก่อน set completed = true
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
              // ไม่ต้องเซ็ต approve_status จาก API นี้ เพราะ API getchildsample_result.php ไม่มีฟิลด์นี้
              // approve_status จะมาจาก API getchildsample_app.php ใน syncBookings() แทน
              approve_status: localSurvey?.approve_status || 0, // เก็บค่าเดิมจาก local
              // approve_comment มาจาก API getchildsample_app.php ใน syncBookings() - รักษาค่าจาก local
              approve_comment: localSurvey?.approve_comment || null,
              // เก็บ newAppointment จาก local เพราะ user อาจแก้ไขล่าสุด
              newAppointment: localSurvey?.newAppointment || null,
              // เก็บ currentStep จาก local เพื่อรักษา progress
              currentStep: localSurvey?.currentStep || 1,
              currentActivityIndex: localSurvey?.currentActivityIndex || 0,
              currentQ5Index: localSurvey?.currentQ5Index || 0,
              timeupload: result.timeupload,
              lastUpdated: new Date().toISOString(),
            };

            // Merge with existing local images to preserve base64
            if (localSurvey && localSurvey.surveyImages) {
              apiSurveyData.surveyImages = apiSurveyData.surveyImages.map((apiImg, index) => {
                const localImg = localSurvey.surveyImages[index];
                if (localImg && localImg.base64) {
                  return {
                    ...apiImg,
                    base64: localImg.base64, // Keep local base64 for offline support
                  };
                }
                return apiImg;
              });
            }

            if (!localSurvey) {
              // ไม่มีข้อมูล local - สร้างใหม่จาก API
              await app.$indexedDB.saveSurveyProgress(apiSurveyData);
              newCount++;
            } else if (localSurvey.synced === false) {
              // มีข้อมูล local ที่ยัง sync ไม่สำเร็จ - เก็บข้อมูล local ไว้ทั้งหมด
              // approve_status จะถูกอัพเดทจาก syncBookings() แทน

              skippedCount++;
            } else {
              // มีข้อมูล local ที่ sync แล้ว - อัพเดททั้งหมดจาก API
              // (ยกเว้น approve_status ที่จะมาจาก syncBookings)
              await app.$indexedDB.saveSurveyProgress(apiSurveyData);
              updatedCount++;
            }
          } catch (error) {
            console.error(
              `Failed to process survey result for stid: ${result.stid}, time: ${timeValue}`,
              error
            );
            skippedCount++;
          }
        }

        // บันทึกเวลาที่ sync
        await app.$indexedDB.setSetting("survey_results_last_sync", new Date().toISOString());

        // ทำความสะอาดข้อมูลซ้ำหลัง sync
        const cleanupResult = await app.$indexedDB.cleanupDuplicateSurveys();

        return true;
      } catch (error) {
        console.error("Survey results sync failed:", error);
        if (error.response) {
          console.error("API Response:", error.response.status, error.response.data);
        }
        return false;
      }
    }

    /**
     * ส่งข้อมูลการนัดหมายที่แก้ไขออฟไลน์กลับไป API
     */
    async pushBookingsToAPI() {
      try {
        // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
        if (!store.state.isOnline) {
          return false;
        }

        // ตรวจสอบว่า IndexedDB พร้อมใช้งาน
        const dbReady = await app.$indexedDB.ensureInitialized();
        if (!dbReady) {
          console.warn("IndexedDB not ready, skipping push bookings");
          return false;
        }

        // ดึงการนัดหมายที่แก้ไขออฟไลน์
        const unsyncedBookings = await app.$indexedDB.getUnsyncedBookings();

        if (unsyncedBookings.length === 0) {
          return true;
        }

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
            const activities = await app.$indexedDB.getActivityByMonthAgeAndTime(
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

            // หา survey ที่เกี่ยวข้องกับ booking นี้เพื่อดึง recStart
            let recStart = null;
            try {
              const relatedSurvey = await app.$indexedDB.getSurveyProgress(
                booking.stid,
                booking.time_visit || booking.time
              );
              if (relatedSurvey && relatedSurvey.timeStart) {
                recStart = relatedSurvey.timeStart;
              }
            } catch (error) {
              console.warn("Cannot find related survey for booking:", error);
            }

            // ถ้าไม่มี survey หรือไม่มี timeStart ให้สร้าง recStart ใหม่
            if (!recStart) {
              const now = new Date();
              recStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                2,
                "0"
              )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
                2,
                "0"
              )}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(
                2,
                "0"
              )}`;
            }

            // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่ (ใช้ time_visit เป็น unique key)
            const checkResponse = await $axios.$get(
              "/api/parenting2025_census/get/homevisit/getchildsample_app.php",
              {
                params: {
                  homevisitor: username,
                  stid: booking.stid,
                },
              }
            );

            // ตรวจสอบว่ามีรายการที่ตรงกับ stid และ time_visit หรือไม่
            const existingRecord = checkResponse?.results?.find(
              (record) =>
                record.stid === booking.stid &&
                String(record.time_visit) === String(booking.time_visit)
            );

            let syncedCntApp = 1; // ค่าเริ่มต้น

            if (existingRecord) {
              // แก้ไขนัดหมาย (เลื่อนนัด) - ใช้ PUT และเพิ่ม cnt_app
              const currentCntApp = parseInt(existingRecord.cnt_app) || 1;
              const newCntApp = currentCntApp + 1;
              syncedCntApp = newCntApp; // เก็บค่าที่จะ sync กลับ

              await $axios.$put("/api/parenting2025_census/put/homevisit/putdata.php", {
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
                  booking.appointmentTime || "",
                  booking.appointmentDate || "",
                  String(newCntApp),
                  String(booking.month_age || ""),
                  String(booking.time || ""),
                  activityIds[0],
                  activityIds[1],
                  activityIds[2],
                  activityIds[3],
                  activityIds[4],
                ],
                pk: ["stid", "time_visit"],
                pkval: [booking.stid, String(booking.time_visit || 1)],
                tb: "homevisitor_app",
              });
            } else {
              // สร้างนัดหมายครั้งแรก - ใช้ POST (cnt_app = 1)
              syncedCntApp = 1; // ค่าที่จะ sync กลับ

              await $axios.$post("/api/parenting2025_census/post/homevisit/datarecord1row.php", {
                variable: [
                  "recby",
                  "stid",
                  "project",
                  "recStart",
                  "time_visit",
                  "fname_ch",
                  "lname_ch",
                  "month_age",
                  "time",
                  "time_app_first",
                  "date_app_first",
                  "time_app_curr",
                  "date_app_curr",
                  "q1_name",
                  "q2_name",
                  "q3_name",
                  "q4_name",
                  "q5_name",
                  "cnt_app",
                ],
                value: [
                  username || "",
                  booking.stid,
                  "15",
                  recStart,
                  String(booking.time_visit || 1),
                  visitor?.fname || "",
                  visitor?.lname || "",
                  String(booking.month_age || ""),
                  String(booking.time || ""),
                  booking.appointmentTime || "",
                  booking.appointmentDate || "",
                  booking.appointmentTime || "",
                  booking.appointmentDate || "",
                  activityIds[0],
                  activityIds[1],
                  activityIds[2],
                  activityIds[3],
                  activityIds[4],
                  "1",
                ],
                tb: "homevisitor_app",
              });
            }

            // อัพเดทสถานะเป็น synced และ cnt_app
            await app.$indexedDB.updateBooking({
              ...booking,
              cnt_app: syncedCntApp,
              dataSource: "api",
              lastSyncedAt: new Date().toISOString(),
            });

            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Failed to sync booking for stid: ${booking.stid}`, error);
          }
        }

        return errorCount === 0;
      } catch (error) {
        console.error("Bookings push failed:", error);
        return false;
      }
    }

    /**
     * อัพโหลดรูปภาพ base64 ไป S3
     * @param {string} base64Image - รูปภาพในรูปแบบ base64
     * @param {string} picname - ชื่อรูป: "toy" (activity equipment) หรือ "activity" (interaction)
     * @param {string} stid - รหัสผู้รับบริการ
     * @param {string} timeActivity - ครั้งที่เยี่ยม
     * @returns {Promise<string|null>} URL ของรูปภาพบน S3 หรือ null ถ้าล้มเหลว
     */
    async uploadImageToS3(base64Image, picname, stid, timeActivity) {
      //       return "test.jpg";
      try {
        if (!base64Image || !base64Image.startsWith("data:image")) {
          return null;
        }

        const response = await $axios.$post(
          "/api/parenting2025_census/post/homevisit/s3upload.php",
          {
            image: base64Image,
            picname: picname,
            stid: stid,
            time: timeActivity,
          }
        );

        if (response && response.url) {
          return response.url;
        }

        return null;
      } catch (error) {
        console.error("Failed to upload image to S3:", error);
        throw error;
      }
    }

    /**
     * สร้าง timestamp ปัจจุบันในรูปแบบ "YYYY-MM-DD HH:mm:ss"
     * @returns {string} Timestamp string
     */
    generateCurrentTimestamp() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Format datetime string to time format for API (HH.MM น.)
     * @param {string} datetimeStr - Datetime string in format "YYYY-MM-DD HH:mm:ss" or "HH:MM น."
     * @returns {string} Time in format "HH.MM น." or empty string
     */
    formatTimeForAPI(datetimeStr, includeNa = true) {
      if (!datetimeStr) {
        console.warn("formatTimeForAPI: datetimeStr is empty");
        return "";
      }

      try {
        let timePart = datetimeStr;

        // ลบ "น." ก่อนเลย (ถ้ามี)
        timePart = timePart.replace(" น.", "").replace("น.", "").trim();

        // ถ้ายังมี space แสดงว่าเป็น datetime format "YYYY-MM-DD HH:mm:ss"
        if (timePart.includes(" ")) {
          const parts = timePart.split(" ");
          if (parts.length >= 2) {
            timePart = parts[1]; // เอา HH:mm:ss ส่วน
          }
        }

        // Get HH:MM (แยกด้วย : หรือ .)
        const separator = timePart.includes(":") ? ":" : ".";
        const [hours, minutes] = timePart.split(separator);

        if (!hours || !minutes) {
          console.warn("formatTimeForAPI: Invalid time format", timePart);
          return "";
        }

        if (includeNa) {
          return `${hours}.${minutes} น.`;
        } else {
          return `${hours}.${minutes}`;
        }
      } catch (error) {
        console.error("Failed to format time:", error, datetimeStr);
        return "";
      }
    }

    /**
     * Format datetime string to HH:MM format for timeEnd (API spec)
     * @param {string} datetimeStr - Datetime string in format "YYYY-MM-DD HH:mm:ss"
     * @returns {string} Time in format "HH:MM" or empty string
     */
    formatTimeEndForAPI(datetimeStr) {
      if (!datetimeStr) {
        console.warn("formatTimeEndForAPI: datetimeStr is empty");
        return "";
      }

      try {
        // Extract time part from datetime string
        const timePart = datetimeStr.split(" ")[1];
        if (!timePart) {
          console.warn("formatTimeEndForAPI: No time part found in", datetimeStr);
          return "";
        }

        // Get HH:MM
        const [hours, minutes] = timePart.split(":");
        if (!hours || !minutes) {
          console.warn("formatTimeEndForAPI: Invalid time format", timePart);
          return "";
        }

        // Format as HH:MM (use colon, no "น.")
        return `${hours}:${minutes}`;
      } catch (error) {
        console.error("Failed to format timeEnd:", error, datetimeStr);
        return "";
      }
    }

    /**
     * ส่งผลการทำแบบทดสอบที่ยังไม่ sync กลับไป API
     */
    async pushSurveyResultsToAPI() {
      try {
        // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
        if (!store.state.isOnline) {
          return false;
        }

        // ตรวจสอบว่า IndexedDB พร้อมใช้งาน
        const dbReady = await app.$indexedDB.ensureInitialized();
        if (!dbReady) {
          console.warn("IndexedDB not ready, skipping push survey results");
          return false;
        }

        // ดึงแบบสอบถามที่เสร็จแล้วแต่ยังไม่ sync
        const unsyncedSurveys = await app.$indexedDB.getUnsyncedSurveys();

        if (unsyncedSurveys.length === 0) {
          return true;
        }

        let successCount = 0;
        let errorCount = 0;

        // Get username
        const username = app.$offlineAuth?.getUser?.()?.username;

        // ส่งทีละรายการ
        for (const survey of unsyncedSurveys) {
          try {
            // ดึงข้อมูล visitor เพื่อเอา fname, lname
            const visitor = await app.$indexedDB.getVisitor(survey.stid);

            // ตรวจสอบว่า visitor มีข้อมูล fname และ lname
            if (!visitor) {
            } else {
              if (!visitor.fname && !visitor.lname) {
              }
            }

            // สร้าง fullname_visit ถ้ายังไม่มี
            if (!survey.fullname_visit && visitor) {
              const fname = visitor.fname || "";
              const lname = visitor.lname || "";
              survey.fullname_visit = fname && lname ? `${fname} ${lname}` : fname || lname || "";
            }

            // ดึงกิจกรรมสำหรับ q9 (กิจกรรมครั้งนี้)
            // แต่ถ้ามี q9 ใน answers แล้ว ให้ใช้ activity IDs จาก q9 แทน (รองรับกรณี skip)
            let q9ActivityNames = [];

            if (survey.answers?.q9 && Object.keys(survey.answers.q9).length > 0) {
              // ใช้ activity IDs จาก q9 (รองรับกรณี skip ที่เก็บ activity IDs ไว้แม้ว่าจะเป็น null)
              const q9ActivityIds = Object.keys(survey.answers.q9).filter((id) => id && id !== "");
              // เติมให้ครบ 5 ตัว
              for (let i = 0; i < 5; i++) {
                if (q9ActivityIds[i]) {
                  q9ActivityNames.push(q9ActivityIds[i]);
                } else {
                  q9ActivityNames.push("");
                }
              }
            } else {
              // fallback: ดึงจาก database
              const q9Activities = await app.$indexedDB.getActivityByMonthAgeAndTime(
                survey.month_age,
                survey.time
              );

              for (let i = 0; i < 5; i++) {
                if (q9Activities && q9Activities[i]) {
                  q9ActivityNames.push(q9Activities[i].no || "");
                } else {
                  q9ActivityNames.push("");
                }
              }
            }

            // สร้าง activity names สำหรับ q5 (q51_name - q55_name)
            // q5 = q9 ของ survey ก่อนหน้าเสมอ (ไม่สน q2)
            const q5ActivityNames = [];
            // ใช้เฉพาะ time_visit (ไม่ใช้ time เป็น fallback)
            let timeVisit = Number(survey.time_visit);
            if (!timeVisit || isNaN(timeVisit) || timeVisit < 1) {
              // ถ้าไม่มี time_visit ให้คำนวณจาก completed surveys
              const completedSurveys = await app.$indexedDB.getCompletedSurveysByStid(survey.stid);
              timeVisit = completedSurveys.length + 1;
            }

            if (timeVisit === 1) {
              // ครั้งแรก ไม่มี q5
              for (let i = 0; i < 5; i++) {
                q5ActivityNames.push("");
              }
            } else {
              // หา previous survey (time_visit - 1) เพื่อใช้ q9 เป็น q5
              const previousTimeVisit = timeVisit - 1;
              try {
                // ลองหา previous survey จาก completed surveys ก่อน
                const completedSurveys = await app.$indexedDB.getCompletedSurveysByStid(
                  survey.stid
                );
                let previousSurvey = completedSurveys.find(
                  (s) => Number(s.time_visit) === previousTimeVisit && s.completed
                );

                // ถ้าไม่พบใน completed surveys ให้ลองหาใน survey progress (รวมทั้งที่ยังไม่ completed)
                if (!previousSurvey) {
                  previousSurvey = await app.$indexedDB.getSurveyProgress(
                    survey.stid,
                    previousTimeVisit
                  );
                }

                // ถ้าไม่พบอีก ให้ลองหาโดยใช้ stid และ time_visit โดยตรง
                if (!previousSurvey) {
                  const allSurveys = await app.$indexedDB.getAllSurveysByStid(survey.stid);
                  previousSurvey = allSurveys.find(
                    (s) => Number(s.time_visit) === previousTimeVisit
                  );
                }

                if (
                  previousSurvey &&
                  previousSurvey.answers &&
                  previousSurvey.answers.q9 &&
                  Object.keys(previousSurvey.answers.q9).length > 0
                ) {
                  // ใช้ q9 จาก previous survey เป็น q5 เสมอ (ไม่สน q2)
                  const q9Answers = previousSurvey.answers.q9;
                  // ดึง activity IDs จาก keys ของ q9 object (แม้จะเป็น null values ก็ตาม)
                  const q5ActivityIds = Object.keys(q9Answers).filter((id) => id && id !== "");

                  // เติมให้ครบ 5 ตัว
                  for (let i = 0; i < 5; i++) {
                    if (q5ActivityIds[i]) {
                      q5ActivityNames.push(q5ActivityIds[i]);
                    } else {
                      q5ActivityNames.push("");
                    }
                  }
                } else {
                  // ถ้า previous survey ไม่มี q9 ให้เป็นค่าว่าง
                  for (let i = 0; i < 5; i++) {
                    q5ActivityNames.push("");
                  }
                }
              } catch (error) {
                // ถ้าเกิด error ในการหา previous survey ให้เป็นค่าว่าง
                console.warn(`Failed to load previous survey for q5ActivityNames:`, error);
                for (let i = 0; i < 5; i++) {
                  q5ActivityNames.push("");
                }
              }
            }

            // Upload images to S3 first, then get URLs
            let pic1 = "";
            let pic2 = "";
            const pic3 = ""; // pic3 ไม่ใช้งาน - ส่งค่าว่าง

            try {
              // Process image 1 (toy/equipment)
              if (survey.surveyImages?.[0]) {
                const img1 = survey.surveyImages[0];
                const hasValidUrl =
                  typeof img1 === "object" &&
                  img1.url &&
                  (img1.url.startsWith("http://") || img1.url.startsWith("https://"));

                if (hasValidUrl) {
                  // รูปมี URL แล้ว (อัพโหลดไปแล้ว) - ใช้ URL เดิม ไม่อัพโหลดซ้ำ
                  pic1 = img1.url;
                } else if ((typeof img1 === "object" && img1.base64) || typeof img1 === "string") {
                  // รูปใหม่ที่ยังไม่มี URL - อัพโหลดไป S3
                  const base64Data = typeof img1 === "object" ? img1.base64 : img1;

                  if (base64Data && base64Data.startsWith("data:image")) {
                    const uploadedUrl = await this.uploadImageToS3(
                      base64Data,
                      "toy",
                      survey.stid,
                      String(survey.time)
                    );
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
                  } else {
                    console.warn("รูปภาพที่ 1 ไม่ถูกต้อง - ข้ามการอัพโหลด");
                  }
                }
              }

              // Process image 2 (activity/interaction)
              if (survey.surveyImages?.[1]) {
                const img2 = survey.surveyImages[1];
                const hasValidUrl =
                  typeof img2 === "object" &&
                  img2.url &&
                  (img2.url.startsWith("http://") || img2.url.startsWith("https://"));

                if (hasValidUrl) {
                  // รูปมี URL แล้ว (อัพโหลดไปแล้ว) - ใช้ URL เดิม ไม่อัพโหลดซ้ำ
                  pic2 = img2.url;
                } else if ((typeof img2 === "object" && img2.base64) || typeof img2 === "string") {
                  // รูปใหม่ที่ยังไม่มี URL - อัพโหลดไป S3
                  const base64Data = typeof img2 === "object" ? img2.base64 : img2;

                  if (base64Data && base64Data.startsWith("data:image")) {
                    const uploadedUrl = await this.uploadImageToS3(
                      base64Data,
                      "activity",
                      survey.stid,
                      String(survey.time)
                    );
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
                  } else {
                    console.warn("รูปภาพที่ 2 ไม่ถูกต้อง - ข้ามการอัพโหลด");
                  }
                }
              }

              // Update survey in IndexedDB with URLs
              await app.$indexedDB.saveSurveyProgress(survey);
            } catch (error) {
              console.error(`Failed to upload images for survey ${survey.id}:`, error);
              errorCount++;
              continue;
            }

            // เช็คว่ามีข้อมูลใน API แล้วหรือยัง
            // ⚠️ สำคัญ: ใช้ time_visit เป็น unique key (ไม่ใช่ time)
            let existingRecord = null;

            // ตรวจสอบว่า survey มี time_visit หรือไม่
            if (!survey.time_visit) {
              console.warn(
                `⚠️ Survey ${survey.id} (stid: ${survey.stid}) missing time_visit. Cannot check existing record.`
              );
            } else {
              try {
                const checkResponse = await $axios.$get(
                  "/api/parenting2025_census/get/homevisit/getchildsample_result.php",
                  {
                    params: {
                      homevisitor: username,
                      stid: survey.stid,
                      time_visit: survey.time_visit,
                    },
                  }
                );

                // ตรวจสอบว่ามีรายการที่ตรงกับ stid และ time_visit หรือไม่
                if (checkResponse?.results && checkResponse.results.length > 0) {
                  existingRecord = checkResponse.results.find(
                    (record) =>
                      String(record.stid) === String(survey.stid) &&
                      String(record.time_visit) === String(survey.time_visit)
                  );

                  // Log warning ถ้าพบ record ที่ time_visit ไม่ตรงกัน
                  if (!existingRecord && checkResponse.results.length > 0) {
                    const foundRecords = checkResponse.results.filter(
                      (record) => String(record.stid) === String(survey.stid)
                    );
                    if (foundRecords.length > 0) {
                      console.warn(
                        `⚠️ Found ${foundRecords.length} record(s) for stid ${
                          survey.stid
                        } but time_visit mismatch. Expected: ${
                          survey.time_visit
                        }, Found: ${foundRecords.map((r) => r.time_visit).join(", ")}`
                      );
                    }
                  }
                }
              } catch (error) {
                console.error(
                  `Failed to check existing record for stid: ${survey.stid}, time_visit: ${survey.time_visit}:`,
                  error
                );
                // ถ้าเช็คไม่ได้ ให้ลองสร้างใหม่แทน
                existingRecord = null;
              }
            }

            // ตรวจสอบและตั้งค่า recStart ถ้าเป็นค่าว่าง (backward compatibility)
            if (!survey.recStart) {
              // ถ้าไม่มี recStart (survey เก่า) ให้สร้างใหม่จากเวลาปัจจุบัน
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, "0");
              const day = String(now.getDate()).padStart(2, "0");
              const hours = String(now.getHours()).padStart(2, "0");
              const minutes = String(now.getMinutes()).padStart(2, "0");
              const seconds = String(now.getSeconds()).padStart(2, "0");
              survey.recStart = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

              // บันทึก recStart กลับไป survey object และ IndexedDB
              await app.$indexedDB.saveSurveyProgress(survey);
            }

            // แปลงข้อมูลนัดหมายจาก newAppointment เป็น format ที่ API ต้องการ
            let q10_appDate = "";
            let q10_appTime = "";

            if (survey.newAppointment) {
              const appointment = survey.newAppointment;

              // แปลง appointmentDate เป็น format "YYYY-MM-DD"
              if (
                appointment.appointmentDay &&
                appointment.appointmentMonth &&
                appointment.appointmentYear
              ) {
                const christianYear = appointment.appointmentYear - 543; // แปลง พ.ศ. เป็น ค.ศ.
                const month = String(appointment.appointmentMonth).padStart(2, "0");
                const day = String(appointment.appointmentDay).padStart(2, "0");
                q10_appDate = `${christianYear}-${month}-${day}`;
              }

              // appointmentTime อยู่ในรูปแบบ "HH:MM น." ต้องแปลงเป็น "HH.MM น." สำหรับ API
              if (appointment.appointmentTime) {
                // แปลง "16:00 น." เป็น "16.00 น."
                q10_appTime = appointment.appointmentTime.replace(":", ".");
              }
            } else {
              console.warn("No newAppointment data found for survey", survey.id);
            }

            if (existingRecord) {
              // มีข้อมูลแล้ว - ใช้ PUT
              const putPayload = {
                variable: [
                  "recEnd",
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
                  "q51_time_last",
                  "q52_time_last",
                  "q53_time_last",
                  "q54_time_last",
                  "q55_time_last",
                  "q91_time_last",
                  "q92_time_last",
                  "q93_time_last",
                  "q94_time_last",
                  "q95_time_last",
                  "q10_appDate",
                  "q10_appTime",
                  "timeEnd",
                  "note",
                  "pic1",
                  "pic2",
                  "pic3",
                ],
                value: [
                  // recEnd: เวลาที่ระบบแก้ไขล่าสุด (system timestamp) - อัปเดตเมื่อมีการแก้ไข
                  survey.recEnd || "",
                  // timeStart: เวลาที่ user กรอกว่าเริ่มทำกิจกรรม (user input - อาจเป็นค่าว่าง)
                  survey.timeStart ? this.formatTimeForAPI(survey.timeStart) : "",
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
                  // q5 ใช้ activity ID เป็น key (รองรับกรณี null เมื่อ q2=3)
                  // ถ้า q5ActivityNames[i] เป็น empty string ให้ส่ง empty string
                  // ถ้า q5ActivityNames[i] มีค่าแต่ q5[activityId] เป็น null หรือ undefined ให้ส่ง empty string
                  q5ActivityNames[0] ? String(survey.answers?.q5?.[q5ActivityNames[0]] ?? "") : "",
                  q5ActivityNames[1] ? String(survey.answers?.q5?.[q5ActivityNames[1]] ?? "") : "",
                  q5ActivityNames[2] ? String(survey.answers?.q5?.[q5ActivityNames[2]] ?? "") : "",
                  q5ActivityNames[3] ? String(survey.answers?.q5?.[q5ActivityNames[3]] ?? "") : "",
                  q5ActivityNames[4] ? String(survey.answers?.q5?.[q5ActivityNames[4]] ?? "") : "",
                  // q6 เป็น single value (รองรับข้อมูลเก่าที่เป็น array)
                  Array.isArray(survey.answers?.q6)
                    ? survey.answers.q6.length > 0
                      ? String(survey.answers.q6[0])
                      : ""
                    : String(survey.answers?.q6 || ""),
                  survey.answers?.q6_other || survey.answers?.q6_des || "",
                  // q7 เป็น single value (1 = มี, 0 = ไม่มี)
                  String(survey.answers?.q7 ?? ""),
                  // q71 เป็น array ต้อง convert เป็น string
                  Array.isArray(survey.answers?.q71)
                    ? survey.answers.q71.join(",")
                    : String(survey.answers?.q71 || ""),
                  survey.answers?.q71_des || "",
                  String(survey.answers?.q8 || ""),
                  q9ActivityNames[0],
                  q9ActivityNames[1],
                  q9ActivityNames[2],
                  q9ActivityNames[3],
                  q9ActivityNames[4],
                  // q9 ใช้ activity ID เป็น key (รองรับกรณี null เมื่อ q2=3)
                  // ถ้า q9ActivityNames[i] เป็น empty string ให้ส่ง empty string
                  // ถ้า q9ActivityNames[i] มีค่าแต่ q9[activityId] เป็น null หรือ undefined ให้ส่ง empty string
                  q9ActivityNames[0] ? String(survey.answers?.q9?.[q9ActivityNames[0]] ?? "") : "",
                  q9ActivityNames[1] ? String(survey.answers?.q9?.[q9ActivityNames[1]] ?? "") : "",
                  q9ActivityNames[2] ? String(survey.answers?.q9?.[q9ActivityNames[2]] ?? "") : "",
                  q9ActivityNames[3] ? String(survey.answers?.q9?.[q9ActivityNames[3]] ?? "") : "",
                  q9ActivityNames[4] ? String(survey.answers?.q9?.[q9ActivityNames[4]] ?? "") : "",
                  // q5x_time_last: เวลาอัพเดตล่าสุดของกิจกรรมข้อ 5 (ทบทวนครั้งก่อน) — ดึงจาก IndexedDB survey_progress
                  survey.q5Timestamps?.[q5ActivityNames[0]]?.last || (q5ActivityNames[0] && survey.answers?.q5?.[q5ActivityNames[0]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[1]]?.last || (q5ActivityNames[1] && survey.answers?.q5?.[q5ActivityNames[1]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[2]]?.last || (q5ActivityNames[2] && survey.answers?.q5?.[q5ActivityNames[2]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[3]]?.last || (q5ActivityNames[3] && survey.answers?.q5?.[q5ActivityNames[3]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[4]]?.last || (q5ActivityNames[4] && survey.answers?.q5?.[q5ActivityNames[4]] != null ? this.generateCurrentTimestamp() : ""),
                  // q9x_time_last: เวลาอัพเดตล่าสุดของกิจกรรมข้อ 9 (ครั้งนี้) — ดึงจาก IndexedDB survey_progress
                  survey.q9Timestamps?.[q9ActivityNames[0]]?.last || (q9ActivityNames[0] && survey.answers?.q9?.[q9ActivityNames[0]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[1]]?.last || (q9ActivityNames[1] && survey.answers?.q9?.[q9ActivityNames[1]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[2]]?.last || (q9ActivityNames[2] && survey.answers?.q9?.[q9ActivityNames[2]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[3]]?.last || (q9ActivityNames[3] && survey.answers?.q9?.[q9ActivityNames[3]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[4]]?.last || (q9ActivityNames[4] && survey.answers?.q9?.[q9ActivityNames[4]] != null ? this.generateCurrentTimestamp() : ""),
                  q10_appDate,
                  q10_appTime,
                  // timeEnd: เวลาที่ user กรอกว่าจบกิจกรรม (user input - format YYYY-MM-DD HH:mm:ss)
                  survey.timeEnd || "",
                  survey.note || survey.answers?.notes || "",
                  pic1,
                  pic2,
                  pic3,
                ],
                pk: ["stid", "time_visit"],
                pkval: [survey.stid, String(survey.time_visit)],
                tb: "homevisitor_result",
              };

              // Validation: ตรวจสอบว่า time_visit ถูกต้องก่อน PUT
              if (!survey.time_visit) {
                console.error(
                  `❌ Cannot PUT survey ${survey.id}: missing time_visit. stid: ${survey.stid}, time: ${survey.time}`
                );
                throw new Error(`Missing time_visit for survey ${survey.id}`);
              }

              await $axios.$put("/api/parenting2025_census/put/homevisit/putdata.php", putPayload);
            } else {
              // ยังไม่มีข้อมูล - ใช้ POST
              const postPayload = {
                variable: [
                  "recby",
                  "stid",
                  "project",
                  "time_visit",
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
                  "q51_time_first",
                  "q52_time_first",
                  "q53_time_first",
                  "q54_time_first",
                  "q55_time_first",
                  "q51_time_last",
                  "q52_time_last",
                  "q53_time_last",
                  "q54_time_last",
                  "q55_time_last",
                  "q91_time_first",
                  "q92_time_first",
                  "q93_time_first",
                  "q94_time_first",
                  "q95_time_first",
                  "q91_time_last",
                  "q92_time_last",
                  "q93_time_last",
                  "q94_time_last",
                  "q95_time_last",
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
                  // Validation: ตรวจสอบว่า time_visit ถูกต้องก่อน POST
                  (() => {
                    if (!survey.time_visit) {
                      console.error(
                        `❌ Cannot POST survey ${survey.id}: missing time_visit. stid: ${survey.stid}, time: ${survey.time}`
                      );
                      throw new Error(`Missing time_visit for survey ${survey.id}`);
                    }
                    return String(survey.time_visit);
                  })(),
                  // recStart: เวลาที่ระบบเริ่มบันทึกจริง (system timestamp)
                  survey.recStart || "",
                  // recEnd: เวลาที่ระบบจบการบันทึกจริง (system timestamp)
                  survey.recEnd || "",
                  "1",
                  visitor?.fname || "",
                  visitor?.lname || "",
                  survey.fullname_visit || "",
                  // date_visit: วันที่ทำแบบทดสอบจริง (extract จาก recStart)
                  survey.recStart
                    ? survey.recStart.split(" ")[0]
                    : new Date().toISOString().split("T")[0],
                  // timeStart: เวลาที่ user กรอกว่าเริ่มทำกิจกรรม (user input - อาจเป็นค่าว่าง)
                  survey.timeStart ? this.formatTimeForAPI(survey.timeStart) : "",
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
                  // q5 ใช้ activity ID เป็น key (รองรับกรณี null เมื่อ q2=3)
                  // ถ้า q5ActivityNames[i] เป็น empty string ให้ส่ง empty string
                  // ถ้า q5ActivityNames[i] มีค่าแต่ q5[activityId] เป็น null หรือ undefined ให้ส่ง empty string
                  q5ActivityNames[0] ? String(survey.answers?.q5?.[q5ActivityNames[0]] ?? "") : "",
                  q5ActivityNames[1] ? String(survey.answers?.q5?.[q5ActivityNames[1]] ?? "") : "",
                  q5ActivityNames[2] ? String(survey.answers?.q5?.[q5ActivityNames[2]] ?? "") : "",
                  q5ActivityNames[3] ? String(survey.answers?.q5?.[q5ActivityNames[3]] ?? "") : "",
                  q5ActivityNames[4] ? String(survey.answers?.q5?.[q5ActivityNames[4]] ?? "") : "",
                  // q6 เป็น single value (รองรับข้อมูลเก่าที่เป็น array)
                  Array.isArray(survey.answers?.q6)
                    ? survey.answers.q6.length > 0
                      ? String(survey.answers.q6[0])
                      : ""
                    : String(survey.answers?.q6 || ""),
                  survey.answers?.q6_other || survey.answers?.q6_des || "",
                  // q7 เป็น single value (1 = มี, 0 = ไม่มี)
                  String(survey.answers?.q7 ?? ""),
                  // q71 เป็น array ต้อง convert เป็น string
                  Array.isArray(survey.answers?.q71)
                    ? survey.answers.q71.join(",")
                    : String(survey.answers?.q71 || ""),
                  survey.answers?.q71_des || "",
                  String(survey.answers?.q8 || ""),
                  q9ActivityNames[0],
                  q9ActivityNames[1],
                  q9ActivityNames[2],
                  q9ActivityNames[3],
                  q9ActivityNames[4],
                  // q9 ใช้ activity ID เป็น key (รองรับกรณี null เมื่อ q2=3)
                  // ถ้า q9ActivityNames[i] เป็น empty string ให้ส่ง empty string
                  // ถ้า q9ActivityNames[i] มีค่าแต่ q9[activityId] เป็น null หรือ undefined ให้ส่ง empty string
                  q9ActivityNames[0] ? String(survey.answers?.q9?.[q9ActivityNames[0]] ?? "") : "",
                  q9ActivityNames[1] ? String(survey.answers?.q9?.[q9ActivityNames[1]] ?? "") : "",
                  q9ActivityNames[2] ? String(survey.answers?.q9?.[q9ActivityNames[2]] ?? "") : "",
                  q9ActivityNames[3] ? String(survey.answers?.q9?.[q9ActivityNames[3]] ?? "") : "",
                  q9ActivityNames[4] ? String(survey.answers?.q9?.[q9ActivityNames[4]] ?? "") : "",
                  // q5x_time_first: เวลาบันทึกครั้งแรกของกิจกรรมข้อ 5 (ทบทวนครั้งก่อน) — ดึงจาก IndexedDB survey_progress
                  survey.q5Timestamps?.[q5ActivityNames[0]]?.first || (q5ActivityNames[0] && survey.answers?.q5?.[q5ActivityNames[0]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[1]]?.first || (q5ActivityNames[1] && survey.answers?.q5?.[q5ActivityNames[1]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[2]]?.first || (q5ActivityNames[2] && survey.answers?.q5?.[q5ActivityNames[2]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[3]]?.first || (q5ActivityNames[3] && survey.answers?.q5?.[q5ActivityNames[3]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[4]]?.first || (q5ActivityNames[4] && survey.answers?.q5?.[q5ActivityNames[4]] != null ? this.generateCurrentTimestamp() : ""),
                  // q5x_time_last: เวลาอัพเดตล่าสุดของกิจกรรมข้อ 5 — ครั้งแรก first = last
                  survey.q5Timestamps?.[q5ActivityNames[0]]?.last || (q5ActivityNames[0] && survey.answers?.q5?.[q5ActivityNames[0]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[1]]?.last || (q5ActivityNames[1] && survey.answers?.q5?.[q5ActivityNames[1]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[2]]?.last || (q5ActivityNames[2] && survey.answers?.q5?.[q5ActivityNames[2]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[3]]?.last || (q5ActivityNames[3] && survey.answers?.q5?.[q5ActivityNames[3]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q5Timestamps?.[q5ActivityNames[4]]?.last || (q5ActivityNames[4] && survey.answers?.q5?.[q5ActivityNames[4]] != null ? this.generateCurrentTimestamp() : ""),
                  // q9x_time_first: เวลาบันทึกครั้งแรกของกิจกรรมข้อ 9 (ครั้งนี้) — ดึงจาก IndexedDB survey_progress
                  survey.q9Timestamps?.[q9ActivityNames[0]]?.first || (q9ActivityNames[0] && survey.answers?.q9?.[q9ActivityNames[0]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[1]]?.first || (q9ActivityNames[1] && survey.answers?.q9?.[q9ActivityNames[1]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[2]]?.first || (q9ActivityNames[2] && survey.answers?.q9?.[q9ActivityNames[2]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[3]]?.first || (q9ActivityNames[3] && survey.answers?.q9?.[q9ActivityNames[3]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[4]]?.first || (q9ActivityNames[4] && survey.answers?.q9?.[q9ActivityNames[4]] != null ? this.generateCurrentTimestamp() : ""),
                  // q9x_time_last: เวลาอัพเดตล่าสุดของกิจกรรมข้อ 9 — ครั้งแรก first = last
                  survey.q9Timestamps?.[q9ActivityNames[0]]?.last || (q9ActivityNames[0] && survey.answers?.q9?.[q9ActivityNames[0]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[1]]?.last || (q9ActivityNames[1] && survey.answers?.q9?.[q9ActivityNames[1]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[2]]?.last || (q9ActivityNames[2] && survey.answers?.q9?.[q9ActivityNames[2]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[3]]?.last || (q9ActivityNames[3] && survey.answers?.q9?.[q9ActivityNames[3]] != null ? this.generateCurrentTimestamp() : ""),
                  survey.q9Timestamps?.[q9ActivityNames[4]]?.last || (q9ActivityNames[4] && survey.answers?.q9?.[q9ActivityNames[4]] != null ? this.generateCurrentTimestamp() : ""),
                  q10_appDate,
                  q10_appTime,
                  // timeEnd: เวลาที่ user กรอกว่าจบกิจกรรม (user input - format YYYY-MM-DD HH:mm:ss)
                  survey.timeEnd || "",
                  survey.note || survey.answers?.notes || "",
                  pic1,
                  pic2,
                  pic3,
                ],
                tb: "homevisitor_result",
              };

              await $axios.$post(
                "/api/parenting2025_census/post/homevisit/datarecord1row.php",
                postPayload
              );

              console.log(
                `✅ Created new survey result for stid: ${survey.stid}, time_visit: ${survey.time_visit}, time: ${survey.time}`
              );
            }

            // อัพเดทสถานะเป็น synced
            await app.$indexedDB.updateSurveySyncStatus(survey.id, true, 0);

            successCount++;
          } catch (error) {
            console.error(
              `Failed to sync survey for stid: ${survey.stid}, time_visit: ${survey.time_visit}, time: ${survey.time}`,
              error
            );
            errorCount++;
          }
        }

        return successCount > 0;
      } catch (error) {
        console.error("Survey results sync failed:", error);
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
