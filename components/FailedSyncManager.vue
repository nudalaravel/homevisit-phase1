<template>
  <div class="failed-sync-manager">
    <b-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-exclamation-triangle text-danger"></i>
            Failed Sync Items
          </h5>
          <b-button
            size="sm"
            variant="outline-primary"
            @click="loadFailedItems"
            :disabled="loading"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            รีเฟรช
          </b-button>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <b-spinner variant="primary"></b-spinner>
        <p class="mt-2 text-muted">กำลังโหลด...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="failedItems.length === 0" class="text-center py-4">
        <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
        <p class="text-muted">ไม่มี failed sync items</p>
      </div>

      <!-- Failed Items List -->
      <div v-else>
        <div class="mb-3 d-flex justify-content-between align-items-center">
          <span class="text-muted">
            พบ {{ failedItems.length }} รายการที่ sync ล้มเหลว
          </span>
          <div>
            <b-button
              size="sm"
              variant="warning"
              class="mr-2"
              @click="retryAll"
              :disabled="retrying"
            >
              <i class="fas fa-redo"></i>
              ลองใหม่ทั้งหมด
            </b-button>
            <b-button
              size="sm"
              variant="danger"
              @click="confirmClearAll"
              :disabled="clearing"
            >
              <i class="fas fa-trash"></i>
              ลบทั้งหมด
            </b-button>
          </div>
        </div>

        <div class="failed-items-list">
          <div
            v-for="item in failedItems"
            :key="item.id"
            class="failed-item"
          >
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-1">
                  <b-badge variant="danger" class="mr-2">FAILED</b-badge>
                  <strong>{{ item.action || 'Unknown Action' }}</strong>
                </div>
                
                <div class="text-muted small mb-1">
                  <i class="fas fa-clock"></i>
                  ล้มเหลวเมื่อ: {{ formatTimestamp(item.failedAt) }}
                </div>
                
                <div v-if="item.retries" class="text-warning small mb-1">
                  <i class="fas fa-redo"></i>
                  พยายาม: {{ item.retries }} ครั้ง
                </div>
                
                <div v-if="item.lastError" class="text-danger small">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ item.lastError }}
                </div>
              </div>
              
              <div class="ml-3">
                <b-button
                  size="sm"
                  variant="outline-warning"
                  class="mr-1"
                  @click="retryItem(item)"
                  :disabled="retrying"
                >
                  <i class="fas fa-redo"></i>
                  ลองใหม่
                </b-button>
                <b-button
                  size="sm"
                  variant="outline-danger"
                  @click="deleteItem(item)"
                  :disabled="clearing"
                >
                  <i class="fas fa-trash"></i>
                  ลบ
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'FailedSyncManager',
  data() {
    return {
      failedItems: [],
      loading: false,
      retrying: false,
      clearing: false
    }
  },
  async mounted() {
    await this.loadFailedItems()
  },
  methods: {
    async loadFailedItems() {
      if (!this.$indexedDB) {
        console.warn('IndexedDB not available')
        return
      }

      this.loading = true
      try {
        this.failedItems = await this.$indexedDB.getFailedSyncItems()
      } catch (error) {
        console.error('Failed to load failed sync items:', error)
        this.$bvToast.toast('ไม่สามารถโหลดรายการได้', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
      } finally {
        this.loading = false
      }
    },

    async retryItem(item) {
      this.retrying = true
      try {
        const success = await this.$indexedDB.retryFailedSyncItem(item.id)
        
        if (success) {
          this.$bvToast.toast('เพิ่มกลับเข้า sync queue แล้ว', {
            title: 'สำเร็จ',
            variant: 'success',
            solid: true
          })
          await this.loadFailedItems()
        } else {
          throw new Error('Retry failed')
        }
      } catch (error) {
        console.error('Failed to retry item:', error)
        this.$bvToast.toast('ไม่สามารถลองใหม่ได้', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
      } finally {
        this.retrying = false
      }
    },

    async retryAll() {
      if (this.failedItems.length === 0) return

      this.retrying = true
      try {
        let successCount = 0
        for (const item of this.failedItems) {
          const success = await this.$indexedDB.retryFailedSyncItem(item.id)
          if (success) successCount++
        }

        this.$bvToast.toast(`เพิ่ม ${successCount} รายการกลับเข้า sync queue แล้ว`, {
          title: 'สำเร็จ',
          variant: 'success',
          solid: true
        })
        await this.loadFailedItems()
      } catch (error) {
        console.error('Failed to retry all items:', error)
        this.$bvToast.toast('ไม่สามารถลองใหม่ทั้งหมดได้', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
      } finally {
        this.retrying = false
      }
    },

    async deleteItem(item) {
      const confirmed = confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')
      if (!confirmed) return

      this.clearing = true
      try {
        await this.$indexedDB.deleteFailedSyncItem(item.id)
        this.$bvToast.toast('ลบรายการสำเร็จ', {
          title: 'สำเร็จ',
          variant: 'success',
          solid: true
        })
        await this.loadFailedItems()
      } catch (error) {
        console.error('Failed to delete item:', error)
        this.$bvToast.toast('ไม่สามารถลบรายการได้', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
      } finally {
        this.clearing = false
      }
    },

    async confirmClearAll() {
      const confirmed = confirm(
        `คุณแน่ใจหรือไม่ที่จะลบทั้งหมด ${this.failedItems.length} รายการ? การกระทำนี้ไม่สามารถย้อนกลับได้`
      )
      if (!confirmed) return

      this.clearing = true
      try {
        await this.$indexedDB.clearFailedSyncItems()
        this.$bvToast.toast('ลบทั้งหมดสำเร็จ', {
          title: 'สำเร็จ',
          variant: 'success',
          solid: true
        })
        await this.loadFailedItems()
      } catch (error) {
        console.error('Failed to clear all items:', error)
        this.$bvToast.toast('ไม่สามารถลบทั้งหมดได้', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
      } finally {
        this.clearing = false
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleString('th-TH')
    }
  }
}
</script>

<style scoped>
.failed-sync-manager {
  margin: 1rem 0;
}

.failed-items-list {
  max-height: 500px;
  overflow-y: auto;
}

.failed-item {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  background-color: #fff;
  transition: box-shadow 0.2s;
}

.failed-item:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.failed-item:last-child {
  margin-bottom: 0;
}
</style>

