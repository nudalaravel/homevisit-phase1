export default function ({ app, store }, inject) {
  // Offline detection and management
  class OfflineManager {
    constructor() {
      this.isOnline = navigator.onLine;
      this.syncQueue = [];
      this.syncInProgress = false;
      this.lastOnlineCheck = null;
      this.onlineCheckInterval = null;
      this.backgroundSyncSupported = "serviceWorker" in navigator && "SyncManager" in window;
      this.setupEventListeners();
      this.loadSyncQueue();
      this.startOnlineCheck();
      this.setupServiceWorkerSync();
    }

    setupServiceWorkerSync() {
      if (!this.backgroundSyncSupported) {
        console.log("[OfflineManager] Background Sync not supported");
        return;
      }

      // Listen for sync registration success from service worker
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "SYNC_COMPLETE") {
            console.log("[OfflineManager] Background sync completed", event.data);
            // Reload data after sync
            if (app.$indexedDB) {
              app.$indexedDB.loadOfflineData();
            }
          }
        });
      }
    }

    async registerBackgroundSync() {
      if (!this.backgroundSyncSupported) {
        console.log("[OfflineManager] Background Sync not supported, falling back to manual sync");
        return this.processSyncQueue();
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register("riped-sync-queue");
        console.log("[OfflineManager] Background sync registered");
        return true;
      } catch (error) {
        console.error("[OfflineManager] Failed to register background sync:", error);
        // Fallback to manual sync
        return this.processSyncQueue();
      }
    }

    async triggerImmediateSync() {
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
        console.log("[OfflineManager] Service worker not available, using manual sync");
        return this.processSyncQueue();
      }

      try {
        // Send message to service worker to trigger sync immediately
        const messageChannel = new MessageChannel();

        return new Promise((resolve, reject) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              console.log("[OfflineManager] Immediate sync completed successfully");
              resolve(true);
            } else {
              console.error("[OfflineManager] Immediate sync failed:", event.data.error);
              reject(new Error(event.data.error));
            }
          };

          navigator.serviceWorker.controller.postMessage({ type: "TRIGGER_SYNC" }, [
            messageChannel.port2,
          ]);
        });
      } catch (error) {
        console.error("[OfflineManager] Failed to trigger immediate sync:", error);
        // Fallback to manual sync
        return this.processSyncQueue();
      }
    }

    setupEventListeners() {
      // Listen for online/offline events
      window.addEventListener("online", () => {
        this.isOnline = true;
        store.commit("setOnlineStatus", true);
        this.showOnlineNotification();
        // Use background sync if supported, otherwise fallback to manual sync
        if (this.backgroundSyncSupported) {
          this.registerBackgroundSync();
        } else {
          this.processSyncQueue();
        }
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        store.commit("setOnlineStatus", false);
        this.showOfflineNotification();
      });

      // Listen for visibility change to sync when tab becomes active
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && this.isOnline) {
          if (this.backgroundSyncSupported) {
            this.registerBackgroundSync();
          } else {
            this.processSyncQueue();
          }
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
          // Use background sync if supported
          if (this.backgroundSyncSupported) {
            await this.registerBackgroundSync();
          } else {
            this.processSyncQueue();
          }
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
            // เช็คว่าต้อง delay ก่อน retry หรือไม่ (exponential backoff)
            if (item.lastRetryAt && item.retries > 0) {
              const timeSinceLastRetry = Date.now() - new Date(item.lastRetryAt).getTime();
              const retryDelay = Math.min(1000 * Math.pow(2, item.retries), 30000); // max 30s

              if (timeSinceLastRetry < retryDelay) {
                // ยังไม่ถึงเวลา retry ข้ามไปก่อน
                continue;
              }
            }

            try {
              await this.syncItem(item);
              // Remove successful item from queue
              this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
            } catch (error) {
              console.error("Sync failed for item:", item, error);
              item.retries = (item.retries || 0) + 1;
              item.lastRetryAt = new Date().toISOString();
              item.lastError = error.message || "Unknown error";

              // ย้ายไป failed queue หลัง retry 10 ครั้ง
              if (item.retries >= 10) {
                item.status = "failed";
                item.failedAt = new Date().toISOString();

                // บันทึกลง IndexedDB ถ้ามี
                if (app.$indexedDB) {
                  await app.$indexedDB.saveFailedSyncItem(item);
                }

                // ลบออกจาก sync queue
                this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
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

    // Check actual online status by pinging server
    async checkOnlineStatus() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        // Ping a static file that we know exists (favicon)
        // Using HEAD request to minimize data transfer
        // Add timestamp to prevent cache
        const response = await fetch("/homevisit/favicon.ico?t=" + Date.now(), {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-cache",
        });

        clearTimeout(timeoutId);

        const isActuallyOnline = response.ok;

        // Update status if changed
        if (this.isOnline !== isActuallyOnline) {
          this.isOnline = isActuallyOnline;
          store.commit("setOnlineStatus", isActuallyOnline);

          if (isActuallyOnline) {
            this.showOnlineNotification();
            this.processSyncQueue();
          } else {
            this.showOfflineNotification();
          }
        }

        this.lastOnlineCheck = new Date().toISOString();
        return isActuallyOnline;
      } catch (error) {
        // If fetch fails, assume offline
        if (this.isOnline) {
          this.isOnline = false;
          store.commit("setOnlineStatus", false);
          this.showOfflineNotification();
        }
        this.lastOnlineCheck = new Date().toISOString();
        return false;
      }
    }

    // Start periodic online status checking (every 30 seconds)
    startOnlineCheck() {
      // Check immediately on start
      this.checkOnlineStatus();

      // Then check every 30 seconds
      this.onlineCheckInterval = setInterval(() => {
        this.checkOnlineStatus();
      }, 30000); // 30 วินาที
    }

    // Stop online status checking
    stopOnlineCheck() {
      if (this.onlineCheckInterval) {
        clearInterval(this.onlineCheckInterval);
        this.onlineCheckInterval = null;
      }
    }

    // Get sync queue status
    getSyncStatus() {
      return {
        isOnline: this.isOnline,
        queueLength: this.syncQueue.length,
        syncInProgress: this.syncInProgress,
        backgroundSyncSupported: this.backgroundSyncSupported,
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
