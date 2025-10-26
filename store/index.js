export const state = () => ({
  // This will be populated by @nuxtjs/auth
  isOnline: true,
  syncQueue: [],
  lastSyncTime: null,
  cacheEnabled: process.env.ENABLE_CACHE === "true",
  patientsCount: 0,
  isSyncing: false,
  systemInitialized: false,
  lastVisitorsSync: null,
  lastActivitiesUpdate: null,
});

export const mutations = {
  // This will be populated by @nuxtjs/auth
  setOnlineStatus(state, status) {
    state.isOnline = status;
  },
  setSyncQueue(state, queue) {
    state.syncQueue = queue;
  },
  setLastSyncTime(state, time) {
    state.lastSyncTime = time;
  },
  setCacheEnabled(state, enabled) {
    state.cacheEnabled = enabled;
  },
  setPatientsCount(state, count) {
    state.patientsCount = count;
  },
  setIsSyncing(state, status) {
    state.isSyncing = status;
  },
  setSystemInitialized(state, status) {
    state.systemInitialized = status;
  },
  setLastVisitorsSync(state, time) {
    state.lastVisitorsSync = time;
  },
  setLastActivitiesUpdate(state, time) {
    state.lastActivitiesUpdate = time;
  },
};

export const actions = {
  // This will be populated by @nuxtjs/auth
  async syncData({ commit, state, $offline }) {
    if (!state.isOnline) {
      return false;
    }

    try {
      await $offline.processSyncQueue();
      commit("setLastSyncTime", new Date().toISOString());
      return true;
    } catch (error) {
      console.error("Sync failed:", error);
      return false;
    }
  },

  async addToSyncQueue({ commit }, { action, data }) {
    if (this.$offline) {
      this.$offline.addToSyncQueue(action, data);
    }
  },

  async initializeSystem({ commit }, app) {
    try {
      const success = await app.$systemInit.initialize();
      commit("setSystemInitialized", success);
      return success;
    } catch (error) {
      console.error("System initialization failed:", error);
      commit("setSystemInitialized", false);
      return false;
    }
  },

  async manualSync({ commit, state, rootState }, app) {
    if (!state.isOnline) {
      return {
        success: false,
        message: "ไม่สามารถซิงค์ได้ เนื่องจากไม่มีอินเทอร์เน็ต",
      };
    }

    if (state.isSyncing) {
      return {
        success: false,
        message: "กำลังซิงค์ข้อมูลอยู่ กรุณารอสักครู่",
      };
    }

    commit("setIsSyncing", true);

    try {
      // ดึง username จาก auth (ใช้ rootState หรือ app context)
      const username =
        rootState.auth?.user?.username ||
        app.$auth?.user?.username ||
        app.$offlineAuth?.getUser?.()?.username;

      if (!username) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      // ส่งการแก้ไข bookings ที่รอ sync ก่อน
      await app.$systemInit.pushBookingsToAPI();

      // ส่งผลการทำแบบทดสอบที่รอ sync
      await app.$systemInit.pushSurveyResultsToAPI();

      // ซิงค์ผู้รับบริการ (getchildsample.php)
      const visitorsSuccess = await app.$systemInit.syncVisitors(username);

      // ซิงค์ข้อมูลวันนัดหมาย (getchildsample_app.php)
      const bookingsSuccess = await app.$systemInit.syncBookings(username);

      // ซิงค์ผลการบันทึกเยี่ยมบ้าน (getchildsample_result.php)
      const surveyResultsSuccess = await app.$systemInit.syncSurveyResults(
        username
      );

      if (visitorsSuccess) {
        const syncTime = new Date().toISOString();
        commit("setLastVisitorsSync", syncTime);
        commit("setLastSyncTime", syncTime);
      }

      // อัพเดทกิจกรรม
      await app.$systemInit.updateActivitiesFromAPI();
      commit("setLastActivitiesUpdate", new Date().toISOString());

      commit("setIsSyncing", false);

      return {
        success: true,
        message: "ซิงค์ข้อมูลสำเร็จ",
      };
    } catch (error) {
      commit("setIsSyncing", false);
      console.error("Manual sync failed:", error);
      return {
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการซิงค์ข้อมูล",
      };
    }
  },
};

export const getters = {
  // This will be populated by @nuxtjs/auth
  isOffline: (state) => !state.isOnline,
  hasPendingSync: (state) => state.syncQueue.length > 0,
  syncStatus: (state) => ({
    isOnline: state.isOnline,
    queueLength: state.syncQueue.length,
    lastSync: state.lastSyncTime,
    cacheEnabled: state.cacheEnabled,
    isSyncing: state.isSyncing,
    lastVisitorsSync: state.lastVisitorsSync,
    lastActivitiesUpdate: state.lastActivitiesUpdate,
  }),
  isSystemInitialized: (state) => state.systemInitialized,
  isSyncing: (state) => state.isSyncing,
};
