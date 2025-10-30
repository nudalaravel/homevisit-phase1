export default function ({ app }, inject) {
  /**
   * IndexedDB Manager สำหรับจัดการข้อมูลออฟไลน์
   * ใช้เก็บข้อมูลในเครื่องผู้ใช้เพื่อรองรับการทำงานแบบออฟไลน์
   */
  class IndexedDBManager {
    constructor() {
      this.dbName = "RipedV2DB"; // ชื่อฐานข้อมูล
      this.version = 10; // เวอร์ชันฐานข้อมูล (เพิ่มเมื่อมีการเปลี่ยนแปลง schema) - เพิ่มเป็น 10 สำหรับ failed_sync store
      this.db = null; // Instance ของ database
      this.isInitialized = false; // สถานะการเริ่มต้นงาน
    }

    /**
     * เริ่มต้นการทำงานของ IndexedDB
     * @returns {Promise<IDBDatabase|null>} Database instance หรือ null ถ้าไม่รองรับ
     */
    async init() {
      // ถ้าเริ่มต้นแล้ว ให้ return database ที่มีอยู่
      if (this.isInitialized) return this.db;

      // ตรวจสอบว่า Browser รองรับ IndexedDB หรือไม่
      if (
        typeof window === "undefined" ||
        !window.indexedDB ||
        typeof window.indexedDB.open !== "function"
      ) {
        console.error("IndexedDB is not available in this browser");
        this.isInitialized = true; // ทำเครื่องหมายว่าพยายามเริ่มต้นแล้ว เพื่อป้องกันการลองซ้ำ
        return null;
      }

      return new Promise((resolve, reject) => {
        // เปิดหรือสร้าง database
        const request = window.indexedDB.open(this.dbName, this.version);

        // เมื่อเกิด error ในการเปิด database
        request.onerror = () => {
          console.error("IndexedDB failed to open:", request.error);
          reject(request.error);
        };

        // เมื่อเปิด database สำเร็จ
        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          resolve(this.db);
        };

        // เมื่อต้องการอัพเกรด database (สร้างใหม่หรือเปลี่ยนเวอร์ชัน)
        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // ลบ Object Stores ที่ไม่ใช้แล้ว
          const storesToDelete = ["users", "orders", "products", "patients"];
          storesToDelete.forEach((storeName) => {
            if (db.objectStoreNames.contains(storeName)) {
              db.deleteObjectStore(storeName);
            }
          });

          // สร้าง Object Stores ที่จำเป็น

          // 1. Settings Store - เก็บการตั้งค่าต่างๆ
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "key" });
          }

          // 2. Sync Queue Store - เก็บคิวข้อมูลที่รอซิงค์กับ server
          if (!db.objectStoreNames.contains("syncQueue")) {
            const syncStore = db.createObjectStore("syncQueue", {
              keyPath: "id",
              autoIncrement: true,
            });
            syncStore.createIndex("action", "action", { unique: false });
            syncStore.createIndex("timestamp", "timestamp", { unique: false });
          }

          // 3. Images Store - เก็บรูปภาพ (base64)
          if (!db.objectStoreNames.contains("images")) {
            const imageStore = db.createObjectStore("images", {
              keyPath: "id",
            });
            imageStore.createIndex("timestamp", "timestamp", { unique: false });
          }

          // 4. Provinces Store - เก็บข้อมูลจังหวัด
          if (!db.objectStoreNames.contains("provinces")) {
            const provinceStore = db.createObjectStore("provinces", {
              keyPath: "prov_code",
            });
            provinceStore.createIndex("prov_name", "prov_name", {
              unique: false,
            });
          }

          // 5. Amphoe Store - เก็บข้อมูลอำเภอ
          if (!db.objectStoreNames.contains("amphoe")) {
            const amphoeStore = db.createObjectStore("amphoe", {
              keyPath: "amp_code",
            });
            amphoeStore.createIndex("prov_code", "prov_code", {
              unique: false,
            });
            amphoeStore.createIndex("amp_name", "amp_name", { unique: false });
          }

          // 6. Tambon Store - เก็บข้อมูลตำบล
          if (!db.objectStoreNames.contains("tambon")) {
            const tambonStore = db.createObjectStore("tambon", {
              keyPath: "tam_code",
            });
            tambonStore.createIndex("amp_code", "amp_code", { unique: false });
            tambonStore.createIndex("tam_name", "tam_name", { unique: false });
          }

          // 7. Activities Store - เก็บข้อมูลกิจกรรม
          if (!db.objectStoreNames.contains("activities")) {
            const activityStore = db.createObjectStore("activities", {
              keyPath: "no",
            });
            activityStore.createIndex("month_age", "month_age", {
              unique: false,
            });
            activityStore.createIndex("time", "time", { unique: false });
          }

          // 9. Visitors Store - เก็บข้อมูลผู้รับบริการ (Home Visitor Sample Students)
          if (!db.objectStoreNames.contains("visitors")) {
            const visitorStore = db.createObjectStore("visitors", {
              keyPath: "stid",
            });
            visitorStore.createIndex("homevisitor", "homevisitor", {
              unique: false,
            });
            visitorStore.createIndex("dataSource", "dataSource", {
              unique: false,
            });
          }

          // 10. Bookings Store - เก็บข้อมูลการนัดหมาย
          if (!db.objectStoreNames.contains("bookings")) {
            const bookingStore = db.createObjectStore("bookings", {
              keyPath: "stid",
            });
            bookingStore.createIndex("dataSource", "dataSource", {
              unique: false,
            });
            bookingStore.createIndex("lastSyncedAt", "lastSyncedAt", {
              unique: false,
            });
          }

          // 11. Survey Progress Store - เก็บความคืบหน้าการทำแบบสอบถาม
          if (!db.objectStoreNames.contains("survey_progress")) {
            const surveyProgressStore = db.createObjectStore("survey_progress", {
              keyPath: "id",
            });
            surveyProgressStore.createIndex("stid", "stid", { unique: false });
            surveyProgressStore.createIndex("time", "time", {
              unique: false,
            });
            surveyProgressStore.createIndex("completed", "completed", {
              unique: false,
            });
            surveyProgressStore.createIndex("lastUpdated", "lastUpdated", {
              unique: false,
            });
          }

          // 12. Failed Sync Store - เก็บคิวข้อมูลที่ sync ล้มเหลว (สำหรับ retry ภายหลัง)
          if (!db.objectStoreNames.contains("failed_sync")) {
            const failedSyncStore = db.createObjectStore("failed_sync", {
              keyPath: "id",
              autoIncrement: true,
            });
            failedSyncStore.createIndex("action", "action", { unique: false });
            failedSyncStore.createIndex("timestamp", "timestamp", { unique: false });
            failedSyncStore.createIndex("failedAt", "failedAt", { unique: false });
            failedSyncStore.createIndex("retries", "retries", { unique: false });
          }
        };
      });
    }

    // ========================================
    // Generic CRUD Operations (พื้นฐาน)
    // ========================================

    /**
     * เพิ่มข้อมูลใหม่เข้า store (ต้องไม่มี key ซ้ำ)
     * @param {string} storeName - ชื่อ object store
     * @param {Object} data - ข้อมูลที่ต้องการเพิ่ม
     * @returns {Promise<any>} Key ของข้อมูลที่เพิ่ม
     */
    async add(storeName, data) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * ดึงข้อมูลจาก store ด้วย key
     * @param {string} storeName - ชื่อ object store
     * @param {any} key - Key ของข้อมูล
     * @returns {Promise<any>} ข้อมูลที่ค้นหา
     */
    async get(storeName, key) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * ดึงข้อมูลทั้งหมดจาก store
     * @param {string} storeName - ชื่อ object store
     * @returns {Promise<Array>} Array ของข้อมูลทั้งหมด
     */
    async getAll(storeName) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return [];
      }

      return new Promise((resolve, reject) => {
        try {
          // ตรวจสอบว่า database connection ยังเปิดอยู่
          if (!this.db || this.db.objectStoreNames.length === 0) {
            console.warn("Database connection is closed, attempting to reinitialize...");
            this.isInitialized = false;
            reject(new Error("Database connection closed"));
            return;
          }

        const transaction = this.db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        } catch (error) {
          console.error("Error in getAll transaction:", error);
          reject(error);
        }
      });
    }

    /**
     * อัพเดทหรือเพิ่มข้อมูล (ถ้ามี key ซ้ำจะเป็นการอัพเดท)
     * @param {string} storeName - ชื่อ object store
     * @param {Object} data - ข้อมูลที่ต้องการบันทึก
     * @returns {Promise<any>} Key ของข้อมูล
     */
    async update(storeName, data) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        try {
          // ตรวจสอบว่า database connection ยังเปิดอยู่
          if (!this.db || this.db.objectStoreNames.length === 0) {
            console.warn("Database connection is closed, attempting to reinitialize...");
            this.isInitialized = false;
            reject(new Error("Database connection closed"));
            return;
          }

        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(data); // put = insert หรือ update

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        } catch (error) {
          console.error("Error in update transaction:", error);
          reject(error);
        }
      });
    }

    /**
     * ลบข้อมูลจาก store
     * @param {string} storeName - ชื่อ object store
     * @param {any} key - Key ของข้อมูลที่ต้องการลบ
     * @returns {Promise<void>}
     */
    async delete(storeName, key) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    // ========================================
    // Settings Operations (จัดการการตั้งค่า)
    // ========================================

    /**
     * บันทึกการตั้งค่า
     * @param {string} key - คีย์การตั้งค่า
     * @param {any} value - ค่าที่ต้องการบันทึก
     */
    async setSetting(key, value) {
      return await this.update("settings", {
        key,
        value,
        lastSync: new Date().toISOString(),
      });
    }

    /**
     * ดึงค่าการตั้งค่า
     * @param {string} key - คีย์การตั้งค่า
     * @returns {Promise<any>} ค่าการตั้งค่า
     */
    async getSetting(key) {
      const result = await this.get("settings", key);
      return result ? result.value : null;
    }

    // ========================================
    // Sync Queue Operations (จัดการคิวซิงค์)
    // ========================================

    /**
     * เพิ่มรายการเข้าคิวซิงค์ (สำหรับซิงค์กับ server เมื่อออนไลน์)
     * @param {string} action - ชื่อ action เช่น CREATE_USER, UPDATE_ORDER
     * @param {Object} data - ข้อมูลที่ต้องการซิงค์
     */
    async addToSyncQueue(item) {
      // Support both old format (action, data) and new format (object)
      const queueItem =
        typeof item === "object" && item.type
          ? item
          : {
              action: arguments[0],
              data: arguments[1],
              timestamp: new Date().toISOString(),
              retries: 0,
            };

      // Ensure timestamp exists
      if (!queueItem.timestamp) {
        queueItem.timestamp = new Date().toISOString();
      }

      // Ensure retries exists
      if (typeof queueItem.retries !== "number") {
        queueItem.retries = 0;
      }

      return await this.add("syncQueue", queueItem);
    }

    /** ดึงคิวซิงค์ทั้งหมด */
    async getSyncQueue() {
      return await this.getAll("syncQueue");
    }

    /** ลบรายการออกจากคิวซิงค์ */
    async removeFromSyncQueue(id) {
      return await this.delete("syncQueue", id);
    }

    // ========================================
    // Image Operations (จัดการรูปภาพ)
    // ========================================

    /**
     * บันทึกข้อมูลทั่วไป (ใช้สำหรับรูปภาพและอื่นๆ)
     * @param {string} storeName - ชื่อ store
     * @param {Object} data - ข้อมูล
     */
    async saveData(storeName, data) {
      return await this.update(storeName, data);
    }

    /** ลบข้อมูลทั่วไป */
    async deleteData(storeName, key) {
      return await this.delete(storeName, key);
    }

    /** บันทึกรูปภาพ */
    async saveImage(key, base64Data) {
      return await this.update("images", {
        id: key,
        data: base64Data,
        timestamp: new Date().toISOString(),
      });
    }

    /** ดึงรูปภาพด้วย ID */
    async getImage(id) {
      return await this.get("images", id);
    }

    /** ดึงรูปภาพทั้งหมด */
    async getAllImages() {
      return await this.getAll("images");
    }

    /** ลบรูปภาพ */
    async deleteImage(id) {
      return await this.delete("images", id);
    }

    // ========================================
    // Utility Operations (ฟังก์ชันเสริม)
    // ========================================

    /** ล้างคิวซิงค์ทั้งหมด */
    async clearSyncQueue() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["syncQueue"], "readwrite");
        const store = transaction.objectStore("syncQueue");
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * ดึงสถิติการใช้งาน storage ของแต่ละ store
     * @returns {Promise<Object>} Object ที่มีข้อมูล count และ size ของแต่ละ store
     */
    async getStorageStats() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        return {};
      }

      const stats = {};
      const storeNames = [
        "users",
        "orders",
        "products",
        "settings",
        "syncQueue",
        "patients",
        "images",
      ];

      // วนลูปดึงข้อมูลจากแต่ละ store
      for (const storeName of storeNames) {
        try {
          const data = await this.getAll(storeName);
          stats[storeName] = {
            count: data.length, // จำนวนรายการ
            size: JSON.stringify(data).length, // ขนาดข้อมูล (byte)
          };
        } catch (error) {
          stats[storeName] = { count: 0, size: 0 };
        }
      }

      // คำนวณขนาดรวม
      const totalSize = Object.values(stats).reduce((sum, stat) => sum + stat.size, 0);
      stats.total = {
        count: Object.values(stats).reduce((sum, stat) => sum + stat.count, 0),
        size: totalSize,
      };

      return stats;
    }

    /**
     * ดึงข้อมูล Storage Quota จาก browser
     * @returns {Promise<Object|null>} ข้อมูล quota, usage, available และ percentage
     */
    async getStorageQuota() {
      if (
        typeof navigator !== "undefined" &&
        "storage" in navigator &&
        "estimate" in navigator.storage
      ) {
        try {
          const estimate = await navigator.storage.estimate();
          return {
            quota: estimate.quota,
            usage: estimate.usage,
            available: estimate.quota - estimate.usage,
            percentage: (estimate.usage / estimate.quota) * 100,
          };
        } catch (error) {
          console.error("Failed to get storage quota:", error);
          return null;
        }
      }
      console.warn("Storage quota API not available");
      return null;
    }

    // ========================================
    // Sync Operations (ซิงค์ข้อมูลกับ API)
    // ========================================

    /**
     * ซิงค์ข้อมูลจาก API มาเก็บใน IndexedDB
     * ใช้เมื่อออนไลน์เพื่อดึงข้อมูลล่าสุดจาก server
     */
    async syncFromAPI() {
      if (!navigator.onLine) {
        throw new Error("ไม่สามารถซิงค์ได้ เนื่องจากไม่มีอินเทอร์เน็ต");
      }

      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        throw new Error("IndexedDB is not available for sync");
      }

      try {
        // ซิงค์ข้อมูลผู้ใช้
        const usersResponse = await app.$axios.get("/users");
        if (usersResponse.data) {
          for (const user of usersResponse.data) {
            await this.updateUser(user);
          }
        }

        // ซิงค์ข้อมูลคำสั่งซื้อ
        const ordersResponse = await app.$axios.get("/orders");
        if (ordersResponse.data) {
          for (const order of ordersResponse.data) {
            await this.updateOrder(order);
          }
        }

        // ซิงค์ข้อมูลสินค้า
        const productsResponse = await app.$axios.get("/products");
        if (productsResponse.data) {
          for (const product of productsResponse.data) {
            await this.updateProduct(product);
          }
        }

        // บันทึกเวลาซิงค์ล่าสุด
        await this.setSetting("lastSync", new Date().toISOString());

        return true;
      } catch (error) {
        console.error("Sync from API failed:", error);
        throw error;
      }
    }

    /**
     * ประมวลผลคิูซิงค์ - ส่งข้อมูลที่รอซิงค์ไปยัง API
     * ใช้เมื่อกลับมาออนไลน์เพื่อส่งข้อมูลที่ทำตอนออฟไลน์
     */
    async processSyncQueue() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, sync queue processing skipped");
        return;
      }

      const queue = await this.getSyncQueue();

      // วนลูปส่งแต่ละรายการในคิว
      for (const item of queue) {
        try {
          await this.syncItemToAPI(item);
          await this.removeFromSyncQueue(item.id); // ลบออกจากคิวถ้าสำเร็จ
        } catch (error) {
          console.error("Failed to sync item:", item, error);
          // เพิ่มจำนวนครั้งที่พยายามซิงค์
          item.retries++;
          if (item.retries >= 3) {
            // ลบออกถ้าพยายามเกิน 3 ครั้ง
            await this.removeFromSyncQueue(item.id);
          } else {
            // อัพเดทจำนวนครั้ง retry
            await this.update("syncQueue", item);
          }
        }
      }
    }

    /**
     * ส่งรายการเดียวไปยัง API
     * @param {Object} item - รายการที่ต้องการซิงค์
     */
    async syncItemToAPI(item) {
      if (!navigator.onLine) {
        throw new Error("ไม่สามารถซิงค์ได้ เนื่องจากไม่มีอินเทอร์เน็ต");
      }

      const { action, data } = item;

      // ตรวจสอบประเภท action และเรียก API ที่เหมาะสม
      switch (action) {
        case "CREATE_USER":
          return await app.$axios.post("/users", data);
        case "UPDATE_USER":
          return await app.$axios.put(`/users/${data.id}`, data);
        case "DELETE_USER":
          return await app.$axios.delete(`/users/${data.id}`);
        case "CREATE_ORDER":
          return await app.$axios.post("/orders", data);
        case "UPDATE_ORDER":
          return await app.$axios.put(`/orders/${data.id}`, data);
        case "DELETE_ORDER":
          return await app.$axios.delete(`/orders/${data.id}`);
        case "CREATE_PRODUCT":
          return await app.$axios.post("/products", data);
        case "UPDATE_PRODUCT":
          return await app.$axios.put(`/products/${data.id}`, data);
        case "DELETE_PRODUCT":
          return await app.$axios.delete(`/products/${data.id}`);
        default:
          throw new Error(`Unknown sync action: ${action}`);
      }
    }

    // ========================================
    // Helper Methods (ฟังก์ชันช่วย)
    // ========================================

    /**
     * ตรวจสอบและเริ่มต้น database ถ้ายังไม่ได้เริ่มต้น
     * @returns {Promise<boolean>} true ถ้าพร้อมใช้งาน
     */
    async ensureInitialized() {
      if (!this.isInitialized) {
        const result = await this.init();
        if (!result) {
          // ไม่ throw error แต่ return false เพื่อบอกว่าล้มเหลว
          return false;
        }
      }
      return true;
    }

    /**
     * ล้างข้อมูลทั้งหมดใน database
     * ⚠️ ระวัง: จะลบข้อมูลทั้งหมดและไม่สามารถกู้คืนได้
     */
    async clearAllData() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      const storeNames = [
        "settings",
        "syncQueue",
        "images",
        "provinces",
        "amphoe",
        "tambon",
        "activities",
        "visitors",
      ];

      // ล้างข้อมูลทุก store
      for (const storeName of storeNames) {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        await new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }

    // ========================================
    // Location Data Operations (จัดการข้อมูลที่อยู่)
    // ========================================

    /** เพิ่มจังหวัด */
    async addProvince(province) {
      return await this.update("provinces", province);
    }

    /** เพิ่มจังหวัดหลายรายการ */
    async addProvinces(provinces) {
      for (const province of provinces) {
        await this.addProvince(province);
      }
    }

    /** ดึงจังหวัดทั้งหมด */
    async getProvinces() {
      return await this.getAll("provinces");
    }

    /** ดึงจังหวัดด้วยรหัส */
    async getProvince(provCode) {
      return await this.get("provinces", provCode);
    }

    /** ลบจังหวัดทั้งหมด */
    async clearProvinces() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["provinces"], "readwrite");
        const store = transaction.objectStore("provinces");
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    /** เพิ่มอำเภอ */
    async addAmphoe(amphoe) {
      return await this.update("amphoe", amphoe);
    }

    /** เพิ่มอำเภอหลายรายการ */
    async addAmphoes(amphoes) {
      for (const amphoe of amphoes) {
        await this.addAmphoe(amphoe);
      }
    }

    /** ดึงอำเภอทั้งหมด */
    async getAmphoes() {
      return await this.getAll("amphoe");
    }

    /** ดึงอำเภอตามจังหวัด */
    async getAmphoesByProvince(provCode) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["amphoe"], "readonly");
        const store = transaction.objectStore("amphoe");
        const index = store.index("prov_code");
        const request = index.getAll(provCode);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /** ลบอำเภอทั้งหมด */
    async clearAmphoes() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["amphoe"], "readwrite");
        const store = transaction.objectStore("amphoe");
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    /** เพิ่มตำบล */
    async addTambon(tambon) {
      return await this.update("tambon", tambon);
    }

    /** เพิ่มตำบลหลายรายการ */
    async addTambons(tambons) {
      for (const tambon of tambons) {
        await this.addTambon(tambon);
      }
    }

    /** ดึงตำบลทั้งหมด */
    async getTambons() {
      return await this.getAll("tambon");
    }

    /** ดึงตำบลตามอำเภอ */
    async getTambonsByAmphoe(ampCode) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["tambon"], "readonly");
        const store = transaction.objectStore("tambon");
        const index = store.index("amp_code");
        const request = index.getAll(ampCode);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /** ลบตำบลทั้งหมด */
    async clearTambons() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["tambon"], "readwrite");
        const store = transaction.objectStore("tambon");
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    /** ลบข้อมูลที่อยู่ทั้งหมด (จังหวัด, อำเภอ, ตำบล) */
    async clearAllLocationData() {
      await this.clearProvinces();
      await this.clearAmphoes();
      await this.clearTambons();
    }

    // ========================================
    // Activities Operations (จัดการกิจกรรม)
    // ========================================

    /** เพิ่มหรืออัพเดทกิจกรรม */
    async addActivity(activity) {
      return await this.update("activities", activity);
    }

    /** เพิ่มกิจกรรมหลายรายการ */
    async addActivities(activities) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        throw new Error("Database not initialized");
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["activities"], "readwrite");
        const store = transaction.objectStore("activities");

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Process all activities in a single transaction
        activities.forEach((activity, index) => {
          try {
            const request = store.put(activity);

            request.onsuccess = () => {
              successCount++;
            };

            request.onerror = () => {
              errorCount++;
              errors.push({
                index,
                no: activity.no,
                error: request.error,
              });
              console.error(`Failed to add activity ${activity.no}:`, request.error);
            };
          } catch (error) {
            errorCount++;
            errors.push({
              index,
              no: activity.no,
              error,
            });
            console.error(`Error processing activity ${activity.no}:`, error);
          }
        });

        transaction.oncomplete = () => {
          if (errors.length > 0) {
            console.warn("Activities insert errors:", errors);
          }
          resolve({ successCount, errorCount, errors });
        };

        transaction.onerror = () => {
          console.error("Transaction error:", transaction.error);
          reject(transaction.error);
        };
      });
    }

    /** ดึงกิจกรรมทั้งหมด */
    async getActivities() {
      return await this.getAll("activities");
    }

    /** ดึงกิจกรรมตามอายุเดือน */
    async getActivitiesByMonthAge(monthAge) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["activities"], "readonly");
        const store = transaction.objectStore("activities");
        const index = store.index("month_age");
        const request = index.getAll(monthAge);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /** ล้างกิจกรรมทั้งหมด */
    async clearActivities() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["activities"], "readwrite");
        const store = transaction.objectStore("activities");
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    /** ดึงกิจกรรมตามอายุเดือนและครั้งที่เยี่ยม */
    async getActivityByMonthAgeAndTime(monthAge, timeActivity) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.error("IndexedDB not initialized");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["activities"], "readonly");
        const store = transaction.objectStore("activities");
        const request = store.openCursor();
        const matchingActivities = [];
        let totalScanned = 0;

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const activity = cursor.value;
            totalScanned++;

            // Convert both to numbers for comparison since API returns strings
            if (
              Number(activity.month_age) === Number(monthAge) &&
              Number(activity.time) === Number(timeActivity)
            ) {
              matchingActivities.push(activity);
            }
            cursor.continue();
          } else {
            // Return array of all matching activities
            // Format each activity to ensure consistent structure
            const formattedActivities = matchingActivities.map((activity) => ({
              ...activity,
              activity: activity.title || activity.activity || "",
              objective: activity.objective || "",
            }));

            resolve(formattedActivities);
          }
        };
        request.onerror = () => {
          console.error("Error reading activities:", request.error);
          reject(request.error);
        };
      });
    }

    // ========================================
    // Visitors Operations (จัดการผู้รับบริการ)
    // ========================================

    /** เพิ่มหรืออัพเดทผู้รับบริการ */
    async addVisitor(visitor) {
      return await this.update("visitors", {
        ...visitor,
        dataSource: visitor.dataSource || "local",
        lastSyncedAt: visitor.lastSyncedAt || new Date().toISOString(),
      });
    }

    /** เพิ่มผู้รับบริการหลายรายการ */
    async addVisitors(visitors) {
      for (const visitor of visitors) {
        await this.addVisitor(visitor);
      }
    }

    /** ดึงผู้รับบริการทั้งหมด */
    async getVisitors() {
      return await this.getAll("visitors");
    }

    /** ดึงผู้รับบริการด้วย stid */
    async getVisitor(stid) {
      return await this.get("visitors", stid);
    }

    /** ดึงผู้รับบริการตาม homevisitor */
    async getVisitorsByHomevisitor(homevisitor) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["visitors"], "readonly");
        const store = transaction.objectStore("visitors");
        const index = store.index("homevisitor");
        const request = index.getAll(homevisitor);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /** อัพเดทผู้รับบริการ */
    async updateVisitor(visitor) {
      return await this.update("visitors", {
        ...visitor,
        lastSyncedAt: new Date().toISOString(),
      });
    }

    /** ลบผู้รับบริการ */
    async deleteVisitor(stid) {
      return await this.delete("visitors", stid);
    }

    /** ดึงผู้รับบริการที่ยังไม่ได้ sync */
    async getUnsyncedVisitors() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["visitors"], "readonly");
        const store = transaction.objectStore("visitors");
        const index = store.index("dataSource");
        const request = index.getAll("local");

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    // ========================================
    // Bookings Operations (จัดการการนัดหมาย)
    // ========================================

    /** เพิ่มหรืออัพเดทการนัดหมาย */
    async addBooking(booking) {
      return await this.update("bookings", {
        ...booking,
        dataSource: booking.dataSource || "local",
        lastSyncedAt: booking.lastSyncedAt || new Date().toISOString(),
      });
    }

    /** เพิ่มการนัดหมายหลายรายการ */
    async addBookings(bookings) {
      for (const booking of bookings) {
        await this.addBooking(booking);
      }
    }

    /** ดึงการนัดหมายทั้งหมด */
    async getBookings() {
      return await this.getAll("bookings");
    }

    /** ดึงการนัดหมายด้วย stid */
    async getBooking(stid) {
      return await this.get("bookings", stid);
    }

    /** อัพเดทการนัดหมาย */
    async updateBooking(booking) {
      return await this.update("bookings", {
        ...booking,
        lastSyncedAt: new Date().toISOString(),
      });
    }

    /** ลบการนัดหมาย */
    async deleteBooking(stid) {
      return await this.delete("bookings", stid);
    }

    /** ล้างการนัดหมายทั้งหมด */
    async clearBookings() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["bookings"], "readwrite");
        const store = transaction.objectStore("bookings");
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    /** ดึงการนัดหมายที่ยังไม่ได้ sync (แก้ไขออฟไลน์) */
    async getUnsyncedBookings() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["bookings"], "readonly");
        const store = transaction.objectStore("bookings");
        const index = store.index("dataSource");
        const request = index.getAll("local");

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    // ========================================
    // Survey Progress Operations
    // ========================================

    /** บันทึกความคืบหน้าแบบสอบถาม */
    async saveSurveyProgress(data) {
      const surveyData = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      return await this.update("survey_progress", surveyData);
    }

    /** ดึงความคืบหน้าแบบสอบถามที่ยังไม่สำเร็จ */
    async getSurveyProgress(stid, time) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["survey_progress"], "readonly");
        const store = transaction.objectStore("survey_progress");
        const request = store.getAll();

        request.onsuccess = () => {
          const surveys = request.result;
          // Find incomplete survey with matching stid and time
          const incompleteSurvey = surveys.find(
            (s) => s.stid === stid && s.time === time && !s.completed
          );
          resolve(incompleteSurvey || null);
        };
        request.onerror = () => reject(request.error);
      });
    }

    /** ดึงความคืบหน้าแบบสอบถามด้วย ID */
    async getSurveyProgressById(id) {
      return await this.get("survey_progress", id);
    }

    /** ลบความคืบหน้าแบบสอบถาม */
    async deleteSurveyProgress(id) {
      return await this.delete("survey_progress", id);
    }

    /** ทำเครื่องหมายแบบสอบถามว่าเสร็จสิ้น */
    async markSurveyCompleted(id, timeEnd) {
      const survey = await this.getSurveyProgressById(id);
      if (survey) {
        return await this.update("survey_progress", {
          ...survey,
          completed: true,
          timeEnd: timeEnd,
          synced: false, // ยังไม่ได้ sync ขึ้น server
          approve_status: 0, // 0 = ยังไม่อนุมัติ, 1 = อนุมัติแล้ว
          lastUpdated: new Date().toISOString(),
        });
      }
      return null;
    }

    /** อัพเดตสถานะ sync ของแบบสอบถาม */
    async updateSurveySyncStatus(id, synced, approveStatus = 0) {
      const survey = await this.getSurveyProgressById(id);
      if (survey) {
        return await this.update("survey_progress", {
          ...survey,
          synced: synced,
          approve_status: approveStatus,
          lastUpdated: new Date().toISOString(),
        });
      }
      return null;
    }

    /** ดึงแบบสอบถามที่เสร็จสิ้นโดย stid */
    async getCompletedSurveysByStid(stid) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["survey_progress"], "readonly");
        const store = transaction.objectStore("survey_progress");
        const request = store.getAll();

        request.onsuccess = () => {
          const surveys = request.result;

          // Filter เฉพาะ surveys ของ stid นี้ที่เสร็จแล้ว
          const completedSurveys = surveys.filter((s) => {
            const isMatchingStid = String(s.stid) === String(stid);
            const isCompleted = s.completed === true;
            return isMatchingStid && isCompleted;
          });

          // ตรวจสอบว่ามี surveys ซ้ำหรือไม่
          const uniqueKeys = new Set();
          const duplicates = [];

          completedSurveys.forEach((s) => {
            const key = `${s.stid}_${s.time}`;
            if (uniqueKeys.has(key)) {
              duplicates.push(key);
            } else {
              uniqueKeys.add(key);
            }
          });

          if (duplicates.length > 0) {
            console.warn(
              `⚠️ Found ${duplicates.length} duplicate survey keys. This should not happen after cleanup.`
            );
            console.warn(`Duplicates: ${Array.from(new Set(duplicates)).join(", ")}`);
          }

          // Sort by time ascending (เรียงตามครั้งที่เยี่ยม)
          completedSurveys.sort((a, b) => {
            const timeA = parseInt(a.time) || 0;
            const timeB = parseInt(b.time) || 0;
            return timeA - timeB;
          });

          resolve(completedSurveys);
        };
        request.onerror = () => reject(request.error);
      });
    }

    /** ดึงแบบสอบถามทั้งหมด (รวม completed และไม่ completed) ตาม stid */
    async getAllSurveysByStid(stid) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["survey_progress"], "readonly");
        const store = transaction.objectStore("survey_progress");
        const request = store.getAll();

        request.onsuccess = () => {
          const surveys = request.result;
          const allSurveys = surveys.filter((s) => s.stid === stid);
          // Sort by timeStart descending (newest first)
          allSurveys.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));
          resolve(allSurveys);
        };
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * ทำความสะอาดข้อมูล survey ที่ซ้ำกัน
     * รวม surveys ที่มี stid และ time เหมือนกัน
     * เลือกเก็บข้อมูลที่สมบูรณ์ที่สุด (synced หรือ updated ล่าสุด)
     */
    async cleanupDuplicateSurveys() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, cleanup skipped");
        return { removed: 0, merged: 0 };
      }

      try {
        // ดึง surveys ทั้งหมด
        const allSurveys = await this.getAll("survey_progress");

        // จัดกลุ่มตาม stid + time
        const groupedSurveys = new Map();
        allSurveys.forEach((survey) => {
          const key = `${survey.stid}_${survey.time}`;
          if (!groupedSurveys.has(key)) {
            groupedSurveys.set(key, []);
          }
          groupedSurveys.get(key).push(survey);
        });

        let removedCount = 0;
        let mergedCount = 0;

        // ตรวจสอบแต่ละกลุ่ม
        for (const [key, surveys] of groupedSurveys) {
          if (surveys.length > 1) {
            console.warn(`⚠️ Found ${surveys.length} duplicates for ${key}`);

            // เลือก survey ที่ดีที่สุด
            let bestSurvey = surveys[0];

            for (let i = 1; i < surveys.length; i++) {
              const current = surveys[i];

              // เกณฑ์การเลือก (ตามลำดับความสำคัญ):
              // 1. เลือกอันที่ synced = true มาก่อน
              // 2. ถ้า synced เท่ากัน เลือกอันที่ completed = true
              // 3. ถ้า completed เท่ากัน เลือกอันที่มี answers มากกว่า
              // 4. เลือกอันที่ lastUpdated ใหม่กว่า

              const shouldReplace =
                (!bestSurvey.synced && current.synced) || // current synced แล้ว แต่ best ยัง
                (bestSurvey.synced === current.synced &&
                  !bestSurvey.completed &&
                  current.completed) || // completed มากกว่า
                (bestSurvey.synced === current.synced &&
                  bestSurvey.completed === current.completed &&
                  Object.keys(current.answers || {}).length >
                    Object.keys(bestSurvey.answers || {}).length) || // answers มากกว่า
                (bestSurvey.synced === current.synced &&
                  bestSurvey.completed === current.completed &&
                  Object.keys(current.answers || {}).length ===
                    Object.keys(bestSurvey.answers || {}).length &&
                  new Date(current.lastUpdated || 0) > new Date(bestSurvey.lastUpdated || 0)); // updated ใหม่กว่า

              if (shouldReplace) {
                // Merge ข้อมูลที่ดีจาก bestSurvey เข้ากับ current
                const mergedSurvey = {
                  ...current, // เอา current เป็นฐาน
                  // รวมข้อมูลจาก bestSurvey ที่อาจจะสมบูรณ์กว่า
                  answers: {
                    ...(bestSurvey.answers || {}),
                    ...(current.answers || {}),
                  },
                  surveyImages: [
                    ...(bestSurvey.surveyImages || []),
                    ...(current.surveyImages || []),
                  ].filter(
                    (img, index, self) => index === self.findIndex((i) => i.key === img.key) // unique by key
                  ),
                  surveyImageKeys: Array.from(
                    new Set([
                      ...(bestSurvey.surveyImageKeys || []),
                      ...(current.surveyImageKeys || []),
                    ])
                  ),
                  note: current.note || bestSurvey.note, // เอาที่มีค่า
                };

                bestSurvey = mergedSurvey;
              } else if (!current.synced && bestSurvey.synced) {
                // ถ้า bestSurvey synced แล้ว แต่ current ยังไม่ synced
                // ให้รวม answers จาก current ที่อาจมีข้อมูล offline ใหม่
                bestSurvey = {
                  ...bestSurvey,
                  answers: {
                    ...(bestSurvey.answers || {}),
                    ...(current.answers || {}), // รวม answers ใหม่จาก offline
                  },
                };
              }
            }

            // ใช้ id มาตรฐาน
            bestSurvey.id = key;
            bestSurvey.lastUpdated = new Date().toISOString();

            // บันทึก bestSurvey
            await this.saveSurveyProgress(bestSurvey);

            // ลบ surveys อื่นๆ ที่ซ้ำ
            for (const survey of surveys) {
              if (survey.id !== key) {
                try {
                  await this.deleteSurveyProgress(survey.id);
                  removedCount++;
                } catch (error) {
                  console.error(`❌ Failed to remove duplicate ${survey.id}:`, error);
                }
              }
            }

            mergedCount++;
          }
        }

        return { merged: mergedCount, removed: removedCount };
      } catch (error) {
        console.error("❌ Survey cleanup failed:", error);
        return { merged: 0, removed: 0 };
      }
    }

    /** ดึงแบบสอบถามที่เสร็จสิ้นทั้งหมด */
    async getUnsyncedSurveys() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["survey_progress"], "readonly");
        const store = transaction.objectStore("survey_progress");
        const request = store.getAll();

        request.onsuccess = () => {
          // กรองเฉพาะแบบสอบถามที่เสร็จแล้วแต่ยังไม่ sync
          const unsyncedSurveys = request.result.filter(
            (survey) => survey.completed === true && survey.synced === false
          );
          resolve(unsyncedSurveys);
        };

        request.onerror = () => {
          console.error("Failed to get unsynced surveys:", request.error);
          reject(request.error);
        };
      });
    }

    async getCompletedSurveys() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["survey_progress"], "readonly");
        const store = transaction.objectStore("survey_progress");
        const index = store.index("completed");
        const request = index.getAll(true);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    // ========================================
    // Failed Sync Methods (จัดการ sync items ที่ล้มเหลว)
    // ========================================

    /**
     * บันทึก sync item ที่ล้มเหลวลง failed_sync store
     * @param {Object} item - sync item ที่ล้มเหลว
     * @returns {Promise<number>} - ID ของ item ที่บันทึก
     */
    async saveFailedSyncItem(item) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["failed_sync"], "readwrite");
        const store = transaction.objectStore("failed_sync");
        
        const itemToSave = {
          ...item,
          failedAt: item.failedAt || new Date().toISOString(),
          status: "failed",
        };
        
        const request = store.add(itemToSave);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error("Failed to save failed sync item:", request.error);
          reject(request.error);
        };
      });
    }

    /**
     * ดึงรายการ failed sync items ทั้งหมด
     * @returns {Promise<Array>} - Array ของ failed sync items
     */
    async getFailedSyncItems() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["failed_sync"], "readonly");
        const store = transaction.objectStore("failed_sync");
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          console.error("Failed to get failed sync items:", request.error);
          reject(request.error);
        };
      });
    }

    /**
     * ลบ failed sync item ตาม ID
     * @param {number} id - ID ของ item ที่ต้องการลบ
     * @returns {Promise<boolean>} - สำเร็จหรือไม่
     */
    async deleteFailedSyncItem(id) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return false;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["failed_sync"], "readwrite");
        const store = transaction.objectStore("failed_sync");
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          console.error("Failed to delete failed sync item:", request.error);
          reject(request.error);
        };
      });
    }

    /**
     * ย้าย failed sync item กลับไปยัง sync queue เพื่อ retry
     * @param {number} id - ID ของ item ที่ต้องการ retry
     * @returns {Promise<boolean>} - สำเร็จหรือไม่
     */
    async retryFailedSyncItem(id) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return false;
      }

      try {
        // 1. ดึง failed item
        const failedItems = await this.getFailedSyncItems();
        const item = failedItems.find((i) => i.id === id);
        
        if (!item) {
          console.warn("Failed sync item not found:", id);
          return false;
        }

        // 2. เพิ่มกลับเข้า sync queue (รีเซ็ต retries)
        const syncItem = {
          action: item.action,
          data: item.data,
          timestamp: new Date().toISOString(),
          retries: 0,
        };
        
        await this.addToSyncQueue(syncItem.action, syncItem.data);

        // 3. ลบออกจาก failed_sync
        await this.deleteFailedSyncItem(id);

        return true;
      } catch (error) {
        console.error("Failed to retry failed sync item:", error);
        return false;
      }
    }

    /**
     * ลบ failed sync items ทั้งหมด
     * @returns {Promise<boolean>} - สำเร็จหรือไม่
     */
    async clearFailedSyncItems() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return false;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["failed_sync"], "readwrite");
        const store = transaction.objectStore("failed_sync");
        const request = store.clear();

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          console.error("Failed to clear failed sync items:", request.error);
          reject(request.error);
        };
      });
    }

    /**
     * ปิดการเชื่อมต่อ database
     * ควรเรียกเมื่อไม่ใช้งานแล้ว เช่น ก่อน page unload
     */
    close() {
      if (this.db) {
        this.db.close();
        this.isInitialized = false;
      }
    }
  }

  // ========================================
  // Plugin Initialization (เริ่มต้น Plugin)
  // ========================================

  // สร้าง instance ของ IndexedDBManager
  const indexedDB = new IndexedDBManager();

  // เริ่มต้น IndexedDB (เฉพาะฝั่ง client-side เท่านั้น)
  if (process.client) {
    // รอให้ DOM พร้อมก่อนเริ่มต้น
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        indexedDB.init().catch((error) => {
          console.error("Failed to initialize IndexedDB:", error);
        });
      });
    } else {
      // ถ้า DOM พร้อมแล้ว เริ่มต้นเลย
      indexedDB.init().catch((error) => {
        console.error("Failed to initialize IndexedDB:", error);
      });
    }
  }

  // Inject เข้า Vue instance เพื่อให้เรียกใช้ได้จาก this.$indexedDB
  inject("indexedDB", indexedDB);
}
