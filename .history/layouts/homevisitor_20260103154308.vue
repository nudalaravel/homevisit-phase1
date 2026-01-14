<template>
  <div class="homevisitor-layout">
    <!-- Header Bar - ตามแบบเดิม -->
    <header class="header-bar">
      <div class="header-content">
        <!-- Left: Logo + Title -->
        <div class="header-left">
          <div class="logo-box">
            <span class="logo-text">RIPED</span>
          </div>
          <h1 class="header-title">แบบบันทึกข้อมูลสำหรับผู้เยี่ยมบ้าน</h1>
        </div>
        
        <!-- Right: Sync buttons + User info -->
        <div class="header-right">
          <!-- Online/Offline Status -->
          <button class="btn-status" :class="{ 'online': isOnline, 'offline': !isOnline }">
            <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
            <span>{{ isOnline ? 'ออนไลน์' : 'ออฟไลน์' }}</span>
          </button>
          
          <!-- Sync Button -->
          <button class="btn-sync" @click="syncData" :disabled="isSyncing">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isSyncing }"></i>
            <span>ซิงค์ข้อมูล</span>
          </button>
          
          <!-- Info Icon -->
          <button class="btn-icon" title="ข้อมูล">
            <i class="fas fa-info-circle"></i>
          </button>
          
          <!-- User Phone + Children Count -->
          <div class="user-info-box">
            <div class="user-phone">{{ getUserPhone() }}</div>
            <div class="children-count">จำนวนเด็ก {{ getChildrenCount() }} คน</div>
          </div>
          
          <!-- User Avatar with Logout -->
          <div class="user-avatar" @click="logout">
            <i class="fas fa-user-circle"></i>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-wrapper">
        <Nuxt />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOnline: true,
      isSyncing: false
    }
  },
  mounted() {
    // Check online status
    if (process.client) {
      this.isOnline = navigator.onLine
      window.addEventListener('online', this.updateOnlineStatus)
      window.addEventListener('offline', this.updateOnlineStatus)
    }
  },
  beforeDestroy() {
    if (process.client) {
      window.removeEventListener('online', this.updateOnlineStatus)
      window.removeEventListener('offline', this.updateOnlineStatus)
    }
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine
    },
    getUserPhone() {
      const user = this.$store.state.auth?.user || this.$offlineAuth?.getUser()
      return user?.username || user?.phone || '-'
    },
    getChildrenCount() {
      // Try to get from IndexedDB or store
      return this.$store.state.childrenCount || 0
    },
    async syncData() {
      if (this.isSyncing) return
      
      this.isSyncing = true
      try {
        if (this.$systemInit && this.$systemInit.syncAll) {
          await this.$systemInit.syncAll()
          this.$toast.success('ซิงค์ข้อมูลสำเร็จ')
        }
      } catch (error) {
        console.error('Sync error:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการซิงค์ข้อมูล')
      } finally {
        this.isSyncing = false
      }
    },
    async logout() {
      const result = await this.$swal.fire({
        title: 'คุณกำลังจะออกจากระบบใช่หรือไม่',
        text: 'หากออกจากระบบแล้วจะต้องเข้าสู่ระบบใหม่',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ออกจากระบบ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      })

      if (result.isConfirmed) {
        try {
          if (this.$offlineAuth) {
            await this.$offlineAuth.logout()
          } else {
            await this.$auth.logout()
          }
          this.$router.push('/login')
        } catch (error) {
          console.error('Logout error:', error)
          this.$router.push('/login')
        }
      }
    }
  }
}
</script>

<style scoped>
.homevisitor-layout {
  min-height: 100vh;
  background-color: #e8ebf0;
}

/* Header Bar */
.header-bar {
  background: #3551a4;
  color: white;
  padding: 0.5rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Logo Box - RIPED */
.logo-box {
  background: white;
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
}

.logo-text {
  color: #3551a4;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Status Button */
.btn-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.85rem;
  cursor: default;
}

.btn-status.online {
  background: #10b981;
  color: white;
}

.btn-status.offline {
  background: #ef4444;
  color: white;
}

/* Sync Button */
.btn-sync {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f59e0b;
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-sync:hover:not(:disabled) {
  background: #d97706;
}

.btn-sync:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Icon Buttons */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* User Info Box */
.user-info-box {
  text-align: right;
  line-height: 1.3;
}

.user-phone {
  font-size: 0.95rem;
  font-weight: 500;
  color: white;
}

.children-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
}

/* User Avatar */
.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  transition: background 0.2s;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.35);
}

/* Main Content Area */
.main-content {
  width: 100%;
  min-height: calc(100vh - 52px);
  background-color: #e8ebf0;
}

.content-wrapper {
  width: 100%;
  min-height: calc(100vh - 52px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-title {
    font-size: 0.95rem;
  }
  
  .btn-status span,
  .btn-sync span {
    display: none;
  }
  
  .btn-status,
  .btn-sync {
    padding: 0.4rem;
    width: 32px;
    height: 32px;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 0.4rem 0.75rem;
  }

  .header-title {
    display: none;
  }

  .user-info-box {
    display: none;
  }
  
  .header-right {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .btn-icon {
    display: none;
  }
}
</style>
