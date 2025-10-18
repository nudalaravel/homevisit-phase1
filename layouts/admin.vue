<template>
  <div class="admin-layout">
    <!-- Top Header -->
    <header class="top-header">
      <div class="header-container">
        <div class="header-left">
          <div class="logo-container">
            <img src="/logo.png" alt="Logo" class="logo-img" />
          </div>
          <h1 class="page-title">แบบบันทึกข้อมูลสำหรับผู้เยี่ยมบ้าน</h1>
        </div>
        
        <div class="header-right">
          <div class="network-status" :class="{ online: $store.state.isOnline, offline: !$store.state.isOnline }">
            <i class="fas" :class="$store.state.isOnline ? 'fa-wifi' : 'fa-wifi-slash'"></i>
            <span class="status-text">{{ $store.state.isOnline ? 'ออนไลน์' : 'ออฟไลน์' }}</span>
          </div>
          <button 
            class="sync-button" 
            @click="handleSync"
            :disabled="$store.getters.isSyncing || !$store.state.isOnline"
            :title="getSyncTooltip()"
          >
            <i class="fas" :class="$store.getters.isSyncing ? 'fa-sync fa-spin' : 'fa-sync-alt'"></i>
            <span class="sync-text">{{ $store.getters.isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูล' }}</span>
          </button>
          <div class="user-menu">
            <div class="user-info">
              <span class="user-name">{{ $offlineAuth.getUser().username }}</span>
              <span class="patients-count">จำนวนเด็ก {{ $store.state.patientsCount }} คน</span>
            </div>
            <button class="user-avatar" @click="toggleDropdown">
              <i class="fas fa-user-circle"></i>
            </button>
            <div class="dropdown-menu" :class="{ show: showDropdown }">
              <a href="#" @click.prevent="logout">
                <i class="fas fa-sign-out-alt"></i>
                ออกจากระบบ
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="page-content">
      <Nuxt />
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDropdown: false
    }
  },
  computed: {
  
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside)
    
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async handleSync() {
      try {
        const result = await this.$store.dispatch('manualSync', this)
        
        if (result.success) {
          this.$toast.success(result.message)
          // Emit event เพื่อให้ page อื่นๆ reload ข้อมูล
          this.$nuxt.$emit('sync-completed')
        } else {
          this.$toast.error(result.message)
        }
      } catch (error) {
        console.error('Sync error:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการซิงค์ข้อมูล')
      }
    },
    getSyncTooltip() {
      if (!this.$store.state.isOnline) {
        return 'ไม่สามารถซิงค์ได้ขณะออฟไลน์'
      }
      if (this.$store.getters.isSyncing) {
        return 'กำลังซิงค์ข้อมูล...'
      }
      if (this.$store.state.lastSyncTime) {
        const lastSync = new Date(this.$store.state.lastSyncTime)
        return `ซิงค์ข้อมูล (ล่าสุด: ${lastSync.toLocaleString('th-TH')})`
      }
      return 'ซิงค์ข้อมูล'
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    handleClickOutside(event) {
      const userMenu = this.$el.querySelector('.user-menu')
      if (userMenu && !userMenu.contains(event.target)) {
        this.showDropdown = false
      }
    },
    async logout() {
      this.showDropdown = false
      
      // แสดง SweetAlert2 ยืนยันการออกจากระบบ
      const result = await this.$swal.fire({
        title: 'คุณกำลังจะออกจากระบบใช่หรือไม่',
        text: 'หากออกจากระบบแล้วข้อมูลแบบประเมินจะถูกลบทันทีไม่สามารถย้อนกลับมาได้',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ออกจากระบบ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      })
      
      // ถ้าผู้ใช้กด "ใช่, ออกจากระบบ"
      if (result.isConfirmed) {
        try {
          // Perform logout (works both online and offline)
          // This will clear all data and redirect to /login
          await this.$offlineAuth.logout()
        } catch (error) {
          console.error('Logout error:', error)
          
          // Even if error, try to redirect
          this.$router.push('/login').catch(() => {
            window.location.href = '/login'
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.top-header {
  background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo-container {
  display: flex;
  align-items: center;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-img {
  height: 45px;
  width: auto;
  object-fit: contain;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.network-status.online {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.4);
}

.network-status.online i {
  color: #4caf50;
}

.network-status.offline {
  background: rgba(255, 152, 0, 0.2);
  border-color: rgba(255, 152, 0, 0.4);
}

.network-status.offline i {
  color: #ff9800;
}

.network-status i {
  font-size: 1rem;
}

.status-text {
  font-weight: 400;
  white-space: nowrap;
}

.sync-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sync-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.sync-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-button i {
  font-size: 1rem;
}

.sync-text {
  font-weight: 400;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .status-text,
  .sync-text {
    display: none;
  }
  
  .network-status,
  .sync-button {
    padding: 0.5rem;
  }
  
  .header-right {
    gap: 0.75rem;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.user-info {
  text-align: right;
}

.user-name {
  display: block;
  font-weight: 400;
  color: white;
  font-size: 1.05rem;
}

.patients-count {
  display: block;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.user-avatar i {
  font-size: 1.8rem;
  color: white;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: #495057;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.dropdown-menu a i {
  color: #3551a4;
  font-size: 1rem;
}

.dropdown-menu a:hover {
  background-color: #f8f9fa;
  color: #3551a4;
}

.page-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }
  
  .header-left {
    gap: 1rem;
  }
  
  .logo-img {
    height: 35px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .user-name {
    display: none;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .page-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 0.95rem;
  }
  
  .logo-container {
    padding: 0.4rem 0.8rem;
  }
  
  .logo-img {
    height: 30px;
  }
}
</style>

