export const state = () => ({
  // This will be populated by @nuxtjs/auth
  isOnline: true,
  syncQueue: [],
  lastSyncTime: null,
  cacheEnabled: process.env.ENABLE_CACHE === "true",
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
  }),
};
