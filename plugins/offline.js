export default function ({ app, store }, inject) {
  // Offline detection and management
  class OfflineManager {
    constructor() {
      this.isOnline = navigator.onLine;
      this.syncQueue = [];
      this.syncInProgress = false;
      this.setupEventListeners();
      this.loadSyncQueue();
    }

    setupEventListeners() {
      // Listen for online/offline events
      window.addEventListener("online", () => {
        this.isOnline = true;
        store.commit("setOnlineStatus", true);
        this.showOnlineNotification();
        this.processSyncQueue();
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        store.commit("setOnlineStatus", false);
        this.showOfflineNotification();
      });

      // Listen for visibility change to sync when tab becomes active
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && this.isOnline) {
          this.processSyncQueue();
        }
      });
    }

    showOnlineNotification() {
      if (app.$bvToast) {
        app.$bvToast.toast("เชื่อมต่อออนไลน์แล้ว", {
          title: "สถานะการเชื่อมต่อ",
          variant: "success",
          solid: true,
          autoHideDelay: 3000,
        });
      }
    }

    showOfflineNotification() {
      if (app.$bvToast) {
        app.$bvToast.toast("ทำงานในโหมดออฟไลน์", {
          title: "สถานะการเชื่อมต่อ",
          variant: "warning",
          solid: true,
          autoHideDelay: 5000,
        });
      }
    }

    // Add data to sync queue
    async addToSyncQueue(action, data) {
      try {
        // Use IndexedDB if available, fallback to localStorage
        if (app.$indexedDB) {
          await app.$indexedDB.addToSyncQueue(action, data);
        } else {
          const syncItem = {
            id: Date.now() + Math.random(),
            action,
            data,
            timestamp: new Date().toISOString(),
            retries: 0,
          };

          this.syncQueue.push(syncItem);
          this.saveSyncQueue();
        }

        // Try to sync immediately if online
        if (this.isOnline) {
          this.processSyncQueue();
        }
      } catch (error) {
        console.error("Failed to add to sync queue:", error);
      }
    }

    // Process sync queue
    async processSyncQueue() {
      if (this.syncInProgress || !this.isOnline) {
        return;
      }

      this.syncInProgress = true;

      try {
        // Use IndexedDB if available, fallback to localStorage
        if (app.$indexedDB) {
          await app.$indexedDB.processSyncQueue();
        } else {
          if (this.syncQueue.length === 0) {
            return;
          }

          const itemsToSync = [...this.syncQueue];

          for (const item of itemsToSync) {
            try {
              await this.syncItem(item);
              // Remove successful item from queue
              this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
            } catch (error) {
              console.error("Sync failed for item:", item, error);
              item.retries++;

              // Remove item after 3 retries
              if (item.retries >= 3) {
                this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
                console.warn(
                  "Removed item from sync queue after 3 retries:",
                  item
                );
              }
            }
          }

          this.saveSyncQueue();
        }
      } finally {
        this.syncInProgress = false;
      }
    }

    // Sync individual item
    async syncItem(item) {
      const { action, data } = item;

      switch (action) {
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
        case "UPDATE_USER":
          return await app.$axios.put(`/users/${data.id}`, data);
        default:
          throw new Error(`Unknown sync action: ${action}`);
      }
    }

    // Save sync queue to localStorage
    saveSyncQueue() {
      try {
        localStorage.setItem("syncQueue", JSON.stringify(this.syncQueue));
      } catch (error) {
        console.error("Failed to save sync queue:", error);
      }
    }

    // Load sync queue from localStorage
    loadSyncQueue() {
      try {
        const saved = localStorage.getItem("syncQueue");
        if (saved) {
          this.syncQueue = JSON.parse(saved);
        }
      } catch (error) {
        console.error("Failed to load sync queue:", error);
        this.syncQueue = [];
      }
    }

    // Get sync queue status
    getSyncStatus() {
      return {
        isOnline: this.isOnline,
        queueLength: this.syncQueue.length,
        syncInProgress: this.syncInProgress,
      };
    }

    // Clear sync queue
    clearSyncQueue() {
      this.syncQueue = [];
      this.saveSyncQueue();
    }
  }

  // Create offline manager instance
  const offlineManager = new OfflineManager();

  // Inject into Vue instance
  inject("offline", offlineManager);

  // Add to store
  store.commit("setOnlineStatus", navigator.onLine);
}
