<template>
  <div class="storage-status">
    <div class="storage-header">
      <h4>
        <i class="fas fa-database"></i>
        สถานะการจัดเก็บข้อมูล
      </h4>
      <button 
        class="btn btn-sm btn-outline-primary"
        @click="refreshStats"
        :disabled="loading"
      >
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        รีเฟรช
      </button>
    </div>

    <!-- IndexedDB Not Available Warning -->
    <div v-if="!indexedDBAvailable" class="alert alert-warning">
      <i class="fas fa-exclamation-triangle"></i>
      <strong>IndexedDB ไม่พร้อมใช้งาน</strong> - ระบบจะใช้ localStorage แทน
    </div>

    <div class="storage-content">
      <!-- Storage Quota -->
      <div class="quota-section" v-if="quota">
        <div class="quota-bar">
          <div class="quota-label">
            <span>พื้นที่ใช้งาน</span>
            <span class="quota-percentage">{{ quota.percentage.toFixed(1) }}%</span>
          </div>
          <div class="progress">
            <div 
              class="progress-bar" 
              :class="getQuotaClass(quota.percentage)"
              :style="{ width: quota.percentage + '%' }"
            ></div>
          </div>
          <div class="quota-details">
            <small>
              ใช้แล้ว: {{ formatBytes(quota.usage) }} / 
              ทั้งหมด: {{ formatBytes(quota.quota) }}
            </small>
          </div>
        </div>
      </div>

      <!-- Database Statistics -->
      <div class="db-stats">
        <div class="stats-grid">
          <div class="stat-item" v-for="(stat, storeName) in stats" :key="storeName">
            <div class="stat-header">
              <i :class="getStoreIcon(storeName)"></i>
              <span class="stat-name">{{ getStoreName(storeName) }}</span>
            </div>
            <div class="stat-details">
              <div class="stat-count">{{ stat.count }} รายการ</div>
              <div class="stat-size">{{ formatBytes(stat.size) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Last Sync -->
      <div class="sync-info" v-if="lastSync">
        <div class="sync-item">
          <i class="fas fa-clock"></i>
          <span>ซิงค์ล่าสุด: {{ formatDate(lastSync) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="storage-actions">
        <button 
          class="btn btn-sm btn-success"
          @click="syncFromAPI"
          :disabled="!isOnline || syncing"
        >
          <i class="fas fa-download" :class="{ 'fa-spin': syncing }"></i>
          ซิงค์จาก API
        </button>
        
        <button 
          class="btn btn-sm btn-warning"
          @click="processSyncQueue"
          :disabled="!isOnline || processing"
        >
          <i class="fas fa-upload" :class="{ 'fa-spin': processing }"></i>
          ซิงค์คิว
        </button>
        
        <button 
          class="btn btn-sm btn-danger"
          @click="clearAllData"
          :disabled="clearing"
        >
          <i class="fas fa-trash" :class="{ 'fa-spin': clearing }"></i>
          ล้างข้อมูล
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StorageStatus',
  data() {
    return {
      stats: {},
      quota: null,
      lastSync: null,
      loading: false,
      syncing: false,
      processing: false,
      clearing: false,
      indexedDBAvailable: false
    }
  },
  computed: {
    isOnline() {
      return this.$store.state.isOnline
    }
  },
  async mounted() {
    // Wait a bit for IndexedDB to be available
    await this.$nextTick()
    this.checkIndexedDBAvailability()
    
    if (this.indexedDBAvailable) {
      await this.loadStats()
      await this.loadQuota()
      await this.loadLastSync()
    }
  },
  methods: {
    checkIndexedDBAvailability() {
      this.indexedDBAvailable = !!(
        this.$indexedDB && 
        typeof window !== 'undefined' && 
        window.indexedDB && 
        typeof window.indexedDB.open === 'function'
      )
    },

    async loadStats() {
      try {
        if (this.$indexedDB && this.indexedDBAvailable) {
          this.stats = await this.$indexedDB.getStorageStats()
        } else {
          this.stats = {}
        }
      } catch (error) {
        console.error('Failed to load storage stats:', error)
        this.stats = {}
      }
    },

    async loadQuota() {
      try {
        if (this.$indexedDB && this.indexedDBAvailable) {
          this.quota = await this.$indexedDB.getStorageQuota()
        } else {
          this.quota = null
        }
      } catch (error) {
        console.error('Failed to load storage quota:', error)
        this.quota = null
      }
    },

    async loadLastSync() {
      try {
        if (this.$indexedDB && this.indexedDBAvailable) {
          this.lastSync = await this.$indexedDB.getSetting('lastSync')
        } else {
          this.lastSync = null
        }
      } catch (error) {
        console.error('Failed to load last sync:', error)
        this.lastSync = null
      }
    },

    async refreshStats() {
      this.loading = true
      try {
        await Promise.all([
          this.loadStats(),
          this.loadQuota(),
          this.loadLastSync()
        ])
      } finally {
        this.loading = false
      }
    },

    async syncFromAPI() {
      if (!this.indexedDBAvailable) {
        if (this.$bvToast) {
          this.$bvToast.toast('IndexedDB ไม่พร้อมใช้งาน', {
            title: 'ข้อผิดพลาด',
            variant: 'warning',
            solid: true
          })
        }
        return
      }

      this.syncing = true
      try {
        await this.$indexedDB.syncFromAPI()
        await this.refreshStats()
        
        if (this.$bvToast) {
          this.$bvToast.toast('ซิงค์ข้อมูลจาก API สำเร็จ', {
            title: 'สำเร็จ',
            variant: 'success',
            solid: true
          })
        }
      } catch (error) {
        console.error('Sync from API failed:', error)
        if (this.$bvToast) {
          this.$bvToast.toast('ซิงค์ข้อมูลล้มเหลว: ' + error.message, {
            title: 'ข้อผิดพลาด',
            variant: 'danger',
            solid: true
          })
        }
      } finally {
        this.syncing = false
      }
    },

    async processSyncQueue() {
      if (!this.indexedDBAvailable) {
        if (this.$bvToast) {
          this.$bvToast.toast('IndexedDB ไม่พร้อมใช้งาน', {
            title: 'ข้อผิดพลาด',
            variant: 'warning',
            solid: true
          })
        }
        return
      }

      this.processing = true
      try {
        await this.$indexedDB.processSyncQueue()
        await this.refreshStats()
        
        if (this.$bvToast) {
          this.$bvToast.toast('ประมวลผลคิวซิงค์สำเร็จ', {
            title: 'สำเร็จ',
            variant: 'success',
            solid: true
          })
        }
      } catch (error) {
        console.error('Process sync queue failed:', error)
        if (this.$bvToast) {
          this.$bvToast.toast('ประมวลผลคิวซิงค์ล้มเหลว: ' + error.message, {
            title: 'ข้อผิดพลาด',
            variant: 'danger',
            solid: true
          })
        }
      } finally {
        this.processing = false
      }
    },

    async clearAllData() {
      if (!this.indexedDBAvailable) {
        if (this.$bvToast) {
          this.$bvToast.toast('IndexedDB ไม่พร้อมใช้งาน', {
            title: 'ข้อผิดพลาด',
            variant: 'warning',
            solid: true
          })
        }
        return
      }

      if (confirm('คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        this.clearing = true
        try {
          await this.$indexedDB.clearAllData()
          await this.refreshStats()
          
          if (this.$bvToast) {
            this.$bvToast.toast('ล้างข้อมูลทั้งหมดสำเร็จ', {
              title: 'สำเร็จ',
              variant: 'success',
              solid: true
            })
          }
        } catch (error) {
          console.error('Clear all data failed:', error)
          if (this.$bvToast) {
            this.$bvToast.toast('ล้างข้อมูลล้มเหลว: ' + error.message, {
              title: 'ข้อผิดพลาด',
              variant: 'danger',
              solid: true
            })
          }
        } finally {
          this.clearing = false
        }
      }
    },

    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    formatDate(dateString) {
      if (!dateString) return 'ไม่เคยซิงค์'
      const date = new Date(dateString)
      return date.toLocaleString('th-TH')
    },

    getQuotaClass(percentage) {
      if (percentage >= 90) return 'bg-danger'
      if (percentage >= 70) return 'bg-warning'
      return 'bg-success'
    },

    getStoreIcon(storeName) {
      const icons = {
        users: 'fas fa-users',
        orders: 'fas fa-shopping-cart',
        products: 'fas fa-box',
        settings: 'fas fa-cog',
        syncQueue: 'fas fa-sync-alt',
        total: 'fas fa-database'
      }
      return icons[storeName] || 'fas fa-table'
    },

    getStoreName(storeName) {
      const names = {
        users: 'ผู้ใช้',
        orders: 'คำสั่งซื้อ',
        products: 'สินค้า',
        settings: 'การตั้งค่า',
        syncQueue: 'คิวซิงค์',
        total: 'รวมทั้งหมด'
      }
      return names[storeName] || storeName
    }
  }
}
</script>

<style scoped>
.storage-status {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
  margin-bottom: 1rem;
}

.storage-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.03);
}

.storage-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.storage-header h4 i {
  margin-right: 0.5rem;
  color: #3551a4;
}

.storage-content {
  padding: 1.5rem;
}

.quota-section {
  margin-bottom: 1.5rem;
}

.quota-bar {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.quota-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.quota-percentage {
  color: #3551a4;
}

.progress {
  height: 0.75rem;
  background-color: #e9ecef;
  border-radius: 0.375rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.quota-details {
  text-align: center;
  color: #6c757d;
}

.db-stats {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
  text-align: center;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.stat-header i {
  margin-right: 0.5rem;
  color: #3551a4;
}

.stat-name {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-count {
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c3e50;
}

.stat-size {
  font-size: 0.75rem;
  color: #6c757d;
}

.sync-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 0.5rem;
  border: 1px solid #bbdefb;
}

.sync-item {
  display: flex;
  align-items: center;
  color: #1976d2;
  font-size: 0.875rem;
}

.sync-item i {
  margin-right: 0.5rem;
}

.storage-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.storage-actions .btn {
  flex: 1;
  min-width: 120px;
}

.alert {
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
}

.alert-warning {
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.alert i {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .storage-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .storage-actions {
    flex-direction: column;
  }
  
  .storage-actions .btn {
    min-width: auto;
  }
}
</style>
