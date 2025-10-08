<template>
  <div class="online-status">
    <b-badge 
      :variant="isOnline ? 'success' : 'warning'"
      class="status-badge"
    >
      <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
      {{ isOnline ? 'ออนไลน์' : 'ออฟไลน์' }}
    </b-badge>
    
    <b-badge 
      v-if="hasPendingSync"
      variant="info"
      class="sync-badge ml-2"
    >
      <i class="fas fa-sync-alt fa-spin"></i>
      รอซิงค์ {{ syncQueueLength }} รายการ
    </b-badge>
    
    <b-button
      v-if="hasPendingSync && isOnline"
      size="sm"
      variant="outline-primary"
      class="ml-2"
      @click="manualSync"
      :disabled="syncInProgress"
    >
      <i class="fas fa-sync-alt" :class="{ 'fa-spin': syncInProgress }"></i>
      ซิงค์ตอนนี้
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'OnlineStatus',
  data() {
    return {
      indexedDBSyncQueueLength: 0
    }
  },
  computed: {
    isOnline() {
      return this.$store.state.isOnline
    },
    hasPendingSync() {
      return this.$store.getters.hasPendingSync
    },
    syncQueueLength() {
      return this.indexedDBSyncQueueLength || this.$store.state.syncQueue.length
    },
    syncInProgress() {
      return this.$offline?.syncInProgress || false
    }
  },
  async mounted() {
    // Ensure offline manager is available
    if (!this.$offline) {
      console.warn('Offline manager not available');
    }
    
    // Load IndexedDB sync queue length
    await this.loadSyncQueueLength();
  },
  methods: {
    async manualSync() {
      try {
        if (this.$offline) {
          await this.$offline.processSyncQueue()
        } else {
          await this.$store.dispatch('syncData')
        }
        
        if (this.$bvToast) {
          this.$bvToast.toast('ซิงค์ข้อมูลเสร็จสิ้น', {
            title: 'สำเร็จ',
            variant: 'success',
            solid: true
          })
        }
      } catch (error) {
        console.error('Sync failed:', error)
        if (this.$bvToast) {
          this.$bvToast.toast('ซิงค์ข้อมูลล้มเหลว', {
            title: 'ข้อผิดพลาด',
            variant: 'danger',
            solid: true
          })
        }
      }
    },

    async loadSyncQueueLength() {
      if (this.$indexedDB) {
        try {
          const queue = await this.$indexedDB.getSyncQueue()
          this.indexedDBSyncQueueLength = queue.length
        } catch (error) {
          console.error('Failed to load sync queue length:', error)
          this.indexedDBSyncQueueLength = 0
        }
      }
    }
  }
}
</script>

<style scoped>
.online-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 10px auto;
  text-align: center;
}

.status-badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
}

.sync-badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
}

.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
