/**
 * ดึง user level จากหลาย sources (auth state, offline auth, localStorage)
 * @param {Object} rootState - Vuex root state
 * @param {Object} app - Nuxt app context (optional)
 * @returns {number|undefined} user level (1=Admin, 2=Supervisor, 3=Home Visitor)
 */
function resolveUserLevel(rootState, app) {
  let userLevel = rootState.auth?.user?.level;

  if (userLevel === undefined && app) {
    userLevel = app.$auth?.user?.level;
  }

  if (userLevel === undefined && app?.$offlineAuth) {
    const offlineUser = app.$offlineAuth.getUser();
    userLevel = offlineUser?.level;
  }

  if (userLevel === undefined && process.client) {
    try {
      const authDataStr = localStorage.getItem("offline_auth_data");
      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        userLevel = authData?.user?.level;
      }
    } catch (e) {
      // Ignore
    }
  }

  return userLevel;
}

export const state = () => ({
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
  async syncData({ commit, state, rootState, $offline }) {
    const userLevel = resolveUserLevel(rootState);
    if (userLevel === 2) {
      console.log("Sync blocked: Level 2 users cannot use sync features");
      return false;
    }

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

  async initializeSystem({ commit, rootState }, app) {
    const userLevel = resolveUserLevel(rootState, app);
    if (userLevel === 2) {
      commit("setSystemInitialized", false);
      return false;
    }

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
    const userLevel = resolveUserLevel(rootState, app);
    if (userLevel === 2) {
      return {
        success: false,
        message: "ฟีเจอร์ซิงค์ข้อมูลไม่รองรับสำหรับ Supervisor",
      };
    }

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
      const username =
        rootState.auth?.user?.username ||
        app.$auth?.user?.username ||
        app.$offlineAuth?.getUser?.()?.username;

      if (!username) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      // ⬆️ Push: ส่งข้อมูลที่แก้ offline ขึ้น server ก่อน
      await app.$systemInit.pushBookingsToAPI();
      await app.$systemInit.pushSurveyResultsToAPI();

      // ⬇️ Pull: ดึงข้อมูลจาก server
      const visitorsSuccess = await app.$systemInit.syncVisitors(username);
      await app.$systemInit.syncBookings(username);
      await app.$systemInit.syncSurveyResults(username);
      // NOTE: syncApprovalStatus ถูกรวมเข้า syncBookings() แล้ว

      // 🔄 Reconciliation: ตรวจจับ results ที่มีบน server แต่ไม่มี booking → สร้างใหม่
      await app.$systemInit.reconcileMissingBookings();

      if (visitorsSuccess) {
        const syncTime = new Date().toISOString();
        commit("setLastVisitorsSync", syncTime);
        commit("setLastSyncTime", syncTime);
      }

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
