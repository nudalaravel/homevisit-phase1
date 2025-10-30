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
      style="cursor: pointer"
      @click="showSyncQueueDetails"
    >
      <i class="fas fa-sync-alt fa-spin"></i>
      รอซิงค์ {{ syncQueueLength }} รายการ
    </b-badge>

    <!-- Sync Button (only when online) -->
    <b-button
      v-if="isOnline"
      size="sm"
      variant="danger"
      class="sync-button"
      @click="showSyncConfirmation"
      :disabled="syncInProgress"
    >
      <i 
        class="fas fa-sync-alt" 
        :class="{ 'fa-spin': syncInProgress }"
      ></i>
      {{ syncInProgress ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูล' }}
    </b-button>

    <!-- Last Update Time -->
    <div v-if="lastSyncTime" class="last-sync-time">
      <small class="text-muted">
        <i class="fas fa-clock"></i>
        อัพเดทล่าสุด: {{ formatLastSync }}
      </small>
    </div>

    <!-- Sync Confirmation Modal -->
    <b-modal
      id="syncConfirmModal"
      v-model="showSyncModal"
      title="ยืนยันการซิงค์ข้อมูล"
      no-close-on-backdrop
      @ok="confirmSync"
      @hidden="closeSyncModal"
    >
      <div class="sync-confirm-content">
        <i class="fas fa-sync-alt fa-3x text-primary mb-3"></i>
        <p>คุณต้องการซิงค์ข้อมูลกับเซิร์ฟเวอร์หรือไม่?</p>
        <p v-if="hasPendingSync" class="text-info">
          <i class="fas fa-info-circle"></i>
          มีข้อมูล {{ syncQueueLength }} รายการรอซิงค์
        </p>
      </div>
      <template #modal-footer="{ ok, cancel }">
        <b-button variant="secondary" @click="cancel()">
          ยกเลิก
        </b-button>
        <b-button variant="primary" @click="ok()">
          ยืนยัน
        </b-button>
      </template>
    </b-modal>

    <!-- Sync Queue Details Modal -->
    <b-modal
      id="syncQueueModal"
      v-model="showQueueModal"
      title="รายละเอียด Sync Queue"
      size="lg"
      ok-only
      ok-title="ปิด"
    >
      <div v-if="syncQueueDetails.length === 0" class="text-center text-muted">
        <i class="fas fa-check-circle fa-3x mb-3"></i>
        <p>ไม่มีข้อมูลรอซิงค์</p>
      </div>
      <div v-else>
        <div 
          v-for="(item, index) in syncQueueDetails" 
          :key="item.id || index"
          class="sync-queue-item"
        >
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong>{{ item.action || 'Unknown Action' }}</strong>
              <div class="text-muted small">
                เวลา: {{ formatTimestamp(item.timestamp) }}
              </div>
              <div v-if="item.retries" class="text-warning small">
                <i class="fas fa-redo"></i> ลองใหม่: {{ item.retries }} ครั้ง
              </div>
              <div v-if="item.lastError" class="text-danger small">
                <i class="fas fa-exclamation-triangle"></i> {{ item.lastError }}
              </div>
            </div>
            <b-badge :variant="getItemBadgeVariant(item)">
              {{ getItemStatusText(item) }}
            </b-badge>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'OnlineStatus',
  data() {
    return {
      indexedDBSyncQueueLength: 0,
      showSyncModal: false,
      showQueueModal: false,
      lastSyncTime: null,
      syncQueueDetails: []
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
    },
    formatLastSync() {
      if (!this.lastSyncTime) return '-'
      
      const now = new Date()
      const syncDate = new Date(this.lastSyncTime)
      const diffMs = now - syncDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'เมื่อสักครู่'
      if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`
      
      // Format as date time
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return syncDate.toLocaleDateString('th-TH', options)
    }
  },
  async mounted() {
    // Ensure offline manager is available
    if (!this.$offline) {
      console.warn('Offline manager not available');
    }
    
    // Load IndexedDB sync queue length
    await this.loadSyncQueueLength();

    // Load last sync time from localStorage
    const savedLastSync = localStorage.getItem('lastSyncTime')
    if (savedLastSync) {
      this.lastSyncTime = savedLastSync
    }
  },
  methods: {
    showSyncConfirmation() {
      this.showSyncModal = true
    },

    closeSyncModal() {
      this.showSyncModal = false
    },

    async confirmSync() {
      this.showSyncModal = false
      await this.manualSync()
    },

    async manualSync() {
      try {
        if (this.$offline) {
          await this.$offline.processSyncQueue()
        } else {
          await this.$store.dispatch('syncData')
        }
        
        // Update last sync time
        this.lastSyncTime = new Date().toISOString()
        localStorage.setItem('lastSyncTime', this.lastSyncTime)

        // Reload sync queue length
        await this.loadSyncQueueLength()
        
        if (this.$toast) {
          this.$toast.success('ซิงค์ข้อมูลเสร็จสิ้น')
        } else if (this.$bvToast) {
          this.$bvToast.toast('ซิงค์ข้อมูลเสร็จสิ้น', {
            title: 'สำเร็จ',
            variant: 'success',
            solid: true
          })
        }
      } catch (error) {
        console.error('Sync failed:', error)
        if (this.$toast) {
          this.$toast.error('ซิงค์ข้อมูลล้มเหลว')
        } else if (this.$bvToast) {
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
    },

    async showSyncQueueDetails() {
      if (this.$indexedDB) {
        try {
          this.syncQueueDetails = await this.$indexedDB.getSyncQueue()
          this.showQueueModal = true
        } catch (error) {
          console.error('Failed to load sync queue details:', error)
          this.$bvToast.toast('ไม่สามารถโหลดรายละเอียดได้', {
            title: 'ข้อผิดพลาด',
            variant: 'danger',
            solid: true
          })
        }
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleString('th-TH')
    },

    getItemBadgeVariant(item) {
      if (item.retries >= 5) return 'danger'
      if (item.retries >= 3) return 'warning'
      return 'info'
    },

    getItemStatusText(item) {
      if (!item.retries) return 'รอซิงค์'
      return `กำลังลองครั้งที่ ${item.retries + 1}`
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
  gap: 4px;
}

.status-badge {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sync-badge {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sync-button {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
}

.sync-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.last-sync-time {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  height: 36px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.last-sync-time small {
  font-size: 0.75rem;
  white-space: nowrap;
  line-height: 1;
}

.last-sync-time i {
  margin-right: 4px;
}

.sync-confirm-content {
  text-align: center;
  padding: 1rem;
}

.sync-confirm-content i {
  display: block;
  margin: 0 auto 1rem;
}

.sync-confirm-content p {
  margin-bottom: 0.5rem;
  font-size: 1rem;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .online-status {
    justify-content: center;
  }
  
  .last-sync-time {
    width: 100%;
    justify-content: center;
    margin-top: 8px;
  }
}

/* Sync Queue Modal Styles */
.sync-queue-item {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.sync-queue-item:hover {
  background-color: #e9ecef;
}

.sync-queue-item:last-child {
  margin-bottom: 0;
}
</style>
