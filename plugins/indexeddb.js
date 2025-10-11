export default function ({ app }, inject) {
  // IndexedDB Manager for Offline Data Storage
  class IndexedDBManager {
    constructor() {
      this.dbName = "RipedV2DB";
      this.version = 3;
      this.db = null;
      this.isInitialized = false;
    }

    // Initialize IndexedDB
    async init() {
      if (this.isInitialized) return this.db;

      // Check if IndexedDB is available
      if (
        typeof indexedDB === "undefined" ||
        !indexedDB ||
        typeof indexedDB.open !== "function"
      ) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "IndexedDB is not available, using fake IndexedDB for development"
          );
        } else {
          console.warn("IndexedDB is not available in this environment");
        }
        this.isInitialized = true; // Mark as initialized to prevent retries
        return null;
      }

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);

        request.onerror = () => {
          console.error("IndexedDB failed to open:", request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          console.log("IndexedDB initialized successfully");
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Create object stores
          if (!db.objectStoreNames.contains("users")) {
            const userStore = db.createObjectStore("users", { keyPath: "id" });
            userStore.createIndex("email", "email", { unique: true });
            userStore.createIndex("role", "role", { unique: false });
          }

          if (!db.objectStoreNames.contains("orders")) {
            const orderStore = db.createObjectStore("orders", {
              keyPath: "id",
            });
            orderStore.createIndex("customer", "customer", { unique: false });
            orderStore.createIndex("status", "status", { unique: false });
            orderStore.createIndex("date", "date", { unique: false });
          }

          if (!db.objectStoreNames.contains("products")) {
            const productStore = db.createObjectStore("products", {
              keyPath: "id",
            });
            productStore.createIndex("name", "name", { unique: false });
            productStore.createIndex("category", "category", { unique: false });
            productStore.createIndex("price", "price", { unique: false });
          }

          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "key" });
          }

          if (!db.objectStoreNames.contains("syncQueue")) {
            const syncStore = db.createObjectStore("syncQueue", {
              keyPath: "id",
              autoIncrement: true,
            });
            syncStore.createIndex("action", "action", { unique: false });
            syncStore.createIndex("timestamp", "timestamp", { unique: false });
          }

          if (!db.objectStoreNames.contains("patients")) {
            const patientStore = db.createObjectStore("patients", {
              keyPath: "id",
              autoIncrement: true,
            });
            patientStore.createIndex("name", "name", { unique: false });
            patientStore.createIndex("nickname", "nickname", { unique: false });
            patientStore.createIndex("appointmentDate", "appointmentDate", {
              unique: false,
            });
          }

          if (!db.objectStoreNames.contains("images")) {
            const imageStore = db.createObjectStore("images", {
              keyPath: "id",
            });
            imageStore.createIndex("timestamp", "timestamp", { unique: false });
          }

          if (!db.objectStoreNames.contains("surveys")) {
            const surveyStore = db.createObjectStore("surveys", {
              keyPath: "id",
            });
            surveyStore.createIndex("timestamp", "timestamp", {
              unique: false,
            });
          }

          console.log("IndexedDB object stores created");
        };
      });
    }

    // Generic CRUD operations
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

    async getAll(storeName) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    async update(storeName, data) {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

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

    // Specific operations for each data type
    async addUser(user) {
      return await this.add("users", {
        ...user,
        lastSync: new Date().toISOString(),
      });
    }

    async getUsers() {
      return await this.getAll("users");
    }

    async getUser(id) {
      return await this.get("users", id);
    }

    async updateUser(user) {
      return await this.update("users", {
        ...user,
        lastSync: new Date().toISOString(),
      });
    }

    async deleteUser(id) {
      return await this.delete("users", id);
    }

    async addOrder(order) {
      return await this.add("orders", {
        ...order,
        lastSync: new Date().toISOString(),
      });
    }

    async getOrders() {
      return await this.getAll("orders");
    }

    async getOrder(id) {
      return await this.get("orders", id);
    }

    async updateOrder(order) {
      return await this.update("orders", {
        ...order,
        lastSync: new Date().toISOString(),
      });
    }

    async deleteOrder(id) {
      return await this.delete("orders", id);
    }

    async addProduct(product) {
      return await this.add("products", {
        ...product,
        lastSync: new Date().toISOString(),
      });
    }

    async getProducts() {
      return await this.getAll("products");
    }

    async getProduct(id) {
      return await this.get("products", id);
    }

    async updateProduct(product) {
      return await this.update("products", {
        ...product,
        lastSync: new Date().toISOString(),
      });
    }

    async deleteProduct(id) {
      return await this.delete("products", id);
    }

    // Patient operations
    async addPatient(patient) {
      return await this.add("patients", {
        ...patient,
        lastSync: new Date().toISOString(),
      });
    }

    async getPatients() {
      return await this.getAll("patients");
    }

    async getPatient(id) {
      return await this.get("patients", id);
    }

    async updatePatient(patient) {
      return await this.update("patients", {
        ...patient,
        lastSync: new Date().toISOString(),
      });
    }

    async deletePatient(id) {
      return await this.delete("patients", id);
    }

    // Settings operations
    async setSetting(key, value) {
      return await this.update("settings", {
        key,
        value,
        lastSync: new Date().toISOString(),
      });
    }

    async getSetting(key) {
      const result = await this.get("settings", key);
      return result ? result.value : null;
    }

    // Sync queue operations
    async addToSyncQueue(action, data) {
      return await this.add("syncQueue", {
        action,
        data,
        timestamp: new Date().toISOString(),
        retries: 0,
      });
    }

    async getSyncQueue() {
      return await this.getAll("syncQueue");
    }

    async removeFromSyncQueue(id) {
      return await this.delete("syncQueue", id);
    }

    // Image operations
    async saveData(storeName, data) {
      return await this.update(storeName, data);
    }

    async deleteData(storeName, key) {
      return await this.delete(storeName, key);
    }

    async getImage(id) {
      return await this.get("images", id);
    }

    async getAllImages() {
      return await this.getAll("images");
    }

    async deleteImage(id) {
      return await this.delete("images", id);
    }

    // Survey operations
    async saveSurvey(survey) {
      return await this.update("surveys", {
        ...survey,
        lastSync: new Date().toISOString(),
      });
    }

    async getSurveys() {
      return await this.getAll("surveys");
    }

    async getSurvey(id) {
      return await this.get("surveys", id);
    }

    async deleteSurvey(id) {
      return await this.delete("surveys", id);
    }

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

    // Database statistics
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
        "surveys",
      ];

      for (const storeName of storeNames) {
        try {
          const data = await this.getAll(storeName);
          stats[storeName] = {
            count: data.length,
            size: JSON.stringify(data).length,
          };
        } catch (error) {
          stats[storeName] = { count: 0, size: 0 };
        }
      }

      // Calculate total size
      const totalSize = Object.values(stats).reduce(
        (sum, stat) => sum + stat.size,
        0
      );
      stats.total = {
        count: Object.values(stats).reduce((sum, stat) => sum + stat.count, 0),
        size: totalSize,
      };

      return stats;
    }

    // Get storage quota information
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

    // Sync data from API
    async syncFromAPI() {
      if (!navigator.onLine) {
        throw new Error("ไม่สามารถซิงค์ได้ เนื่องจากไม่มีอินเทอร์เน็ต");
      }

      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        throw new Error("IndexedDB is not available for sync");
      }

      try {
        // Sync users
        const usersResponse = await app.$axios.get("/users");
        if (usersResponse.data) {
          for (const user of usersResponse.data) {
            await this.updateUser(user);
          }
        }

        // Sync orders
        const ordersResponse = await app.$axios.get("/orders");
        if (ordersResponse.data) {
          for (const order of ordersResponse.data) {
            await this.updateOrder(order);
          }
        }

        // Sync products
        const productsResponse = await app.$axios.get("/products");
        if (productsResponse.data) {
          for (const product of productsResponse.data) {
            await this.updateProduct(product);
          }
        }

        // Update last sync time
        await this.setSetting("lastSync", new Date().toISOString());

        return true;
      } catch (error) {
        console.error("Sync from API failed:", error);
        throw error;
      }
    }

    // Process sync queue
    async processSyncQueue() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn(
          "IndexedDB is not available, sync queue processing skipped"
        );
        return;
      }

      const queue = await this.getSyncQueue();

      for (const item of queue) {
        try {
          await this.syncItemToAPI(item);
          await this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error("Failed to sync item:", item, error);
          // Increment retry count
          item.retries++;
          if (item.retries >= 3) {
            await this.removeFromSyncQueue(item.id);
          } else {
            await this.update("syncQueue", item);
          }
        }
      }
    }

    // Sync individual item to API
    async syncItemToAPI(item) {
      if (!navigator.onLine) {
        throw new Error("ไม่สามารถซิงค์ได้ เนื่องจากไม่มีอินเทอร์เน็ต");
      }

      const { action, data } = item;

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

    // Helper methods
    async ensureInitialized() {
      if (!this.isInitialized) {
        const result = await this.init();
        if (!result) {
          // Don't throw error, just return false to indicate failure
          return false;
        }
      }
      return true;
    }

    // Clear all data
    async clearAllData() {
      const initialized = await this.ensureInitialized();
      if (!initialized || !this.db) {
        console.warn("IndexedDB is not available, operation skipped");
        return null;
      }

      const storeNames = [
        "users",
        "orders",
        "products",
        "settings",
        "syncQueue",
        "patients",
        "images",
        "surveys",
      ];

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

    // Close database connection
    close() {
      if (this.db) {
        this.db.close();
        this.isInitialized = false;
      }
    }
  }

  // Create IndexedDB manager instance
  const indexedDB = new IndexedDBManager();

  // Initialize IndexedDB
  if (process.client) {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        indexedDB.init().catch((error) => {
          console.error("Failed to initialize IndexedDB:", error);
        });
      });
    } else {
      indexedDB.init().catch((error) => {
        console.error("Failed to initialize IndexedDB:", error);
      });
    }
  }

  // Inject into Vue instance
  inject("indexedDB", indexedDB);
}
