<template>
  <div class="supervisor-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Left Sidebar -->
    <aside class="sidebar">
      <!-- Toggle Button -->
      <button class="sidebar-toggle" @click="toggleSidebar" :title="sidebarCollapsed ? 'ขยาย Sidebar' : 'ย่อ Sidebar'">
        <i :class="sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
      </button>

      <!-- Header -->
      <div class="sidebar-header">
        <h2 class="sidebar-title">{{ sidebarCollapsed ? 'SUP' : 'SUPERVISOR' }}</h2>
      </div>

      <!-- User Profile Section -->
      <div class="user-profile-section">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div v-if="!sidebarCollapsed" class="user-name">{{ getUserName() }}</div>
        <div v-if="!sidebarCollapsed" class="user-role">{{ this.$offlineAuth.getUser().prefix??'' }}</div>
        <div class="user-actions">
          <div class="action-item" @click="logout" :title="sidebarCollapsed ? 'ออกจากระบบ' : ''">
            <i class="fas fa-power-off"></i>
            <span v-if="!sidebarCollapsed">ออกจากระบบ</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <nuxt-link
          to="/supervisor-dashboard"
          class="nav-item"
          :class="{ active: isActiveRoute('supervisor-dashboard') }"
          :title="sidebarCollapsed ? 'ผลการเยี่ยมบ้าน' : ''"
        >
          <i class="fas fa-desktop"></i>
          <span v-if="!sidebarCollapsed">ผลการเยี่ยมบ้าน</span>
        </nuxt-link>
        <nuxt-link
          to="/supervisor-booking"
          class="nav-item"
          :class="{ active: isActiveRoute('supervisor-booking') }"
          :title="sidebarCollapsed ? 'ยืนยันการเยี่ยมบ้าน' : ''"
        >
          <i class="fas fa-clipboard-check"></i>
          <span v-if="!sidebarCollapsed">ยืนยันการเยี่ยมบ้าน</span>
        </nuxt-link>
        <nuxt-link
          to="/supervisor-survey"
          class="nav-item"
          :class="{ active: isActiveRoute('supervisor-survey') }"
          :title="sidebarCollapsed ? 'บันทึกการสังเกตผู้เยี่ยมบ้าน' : ''"
        >
          <i class="fas fa-pencil-alt"></i>
          <span v-if="!sidebarCollapsed">บันทึกการสังเกตผู้เยี่ยมบ้าน</span>
        </nuxt-link>
        <nuxt-link
          to="/supervisor-report"
          class="nav-item"
          :class="{ active: isActiveRoute('supervisor-report') }"
          :title="sidebarCollapsed ? 'สรุปการสังเกตผู้เยี่ยมบ้าน' : ''"
        >
          <i class="fas fa-list"></i>
          <span v-if="!sidebarCollapsed">สรุปการสังเกตผู้เยี่ยมบ้าน</span>
        </nuxt-link>
        <nuxt-link
          to="/supervisor-document"
          class="nav-item"
          :class="{ active: isActiveRoute('supervisor-document') }"
          :title="sidebarCollapsed ? 'การจัดการเอกสารรับเงิน' : ''"
        >
          <i class="fas fa-dollar-sign"></i>
          <span v-if="!sidebarCollapsed">การจัดการเอกสารรับเงิน</span>
        </nuxt-link>
      </nav>
    </aside>

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
      sidebarCollapsed: false
    }
  },
  mounted() {
    // โหลดค่าจาก cookie เมื่อ component mount
    this.loadSidebarState()
  },
  methods: {
    loadSidebarState() {
      const cookieValue = this.getCookie('supervisor_sidebar_collapsed')
      this.sidebarCollapsed = cookieValue === 'true'
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      // บันทึกลง cookie (เก็บ 30 วัน)
      this.setCookie('supervisor_sidebar_collapsed', this.sidebarCollapsed, 30)
    },
    getCookie(name) {
      if (process.client) {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
      }
      return null
    },
    setCookie(name, value, days) {
      if (process.client) {
        const expires = new Date()
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
      }
    },
    getUserName() {
      if (this.$offlineAuth) {
        const user = this.$offlineAuth.getUser()
        return user?.name || user?.username
      }
      return '-'
    },
    isActiveRoute(routeName) {
      const currentPath = this.$route.path || ''
      const currentHash = this.$route.hash || ''
      const fullPath = currentPath + currentHash
      return fullPath.includes(routeName) || currentPath.includes(routeName)
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
.supervisor-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: #3551a4;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  /* overflow-y: auto; */
  z-index: 1000;
  transition: width 0.3s ease;
}

/* Collapsed State */
.sidebar-collapsed .sidebar {
  width: 70px;
}

.sidebar-collapsed .main-content {
  margin-left: 70px;
}

/* Toggle Button */
.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3551a4;
  border: 2px solid white;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  z-index: 1001;
  transition: background 0.2s;
}

.sidebar-toggle:hover {
  background: #2a4185;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: white;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-collapsed .sidebar-title {
  font-size: 0.9rem;
}

/* User Profile Section */
.user-profile-section {
  padding: 1.5rem 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-collapsed .user-profile-section {
  padding: 1rem 0.5rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  margin: 0 auto 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #87ceeb;
}

.sidebar-collapsed .user-avatar {
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: white;
}

.user-role {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.75rem;
}

.user-actions {
  display: flex;
  justify-content: center;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: none;
  font-size: 0.85rem;
}

.sidebar-collapsed .action-item {
  padding: 0.5rem;
  gap: 0;
}

.action-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.action-item i {
  font-size: 1rem;
}

/* Navigation Menu */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: none;
  border-left: 3px solid transparent;
  font-size: 0.95rem;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 1rem 0.5rem;
  gap: 0;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-left-color: #87ceeb;
  font-weight: 500;
}

.nav-item i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.nav-item:last-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-item:last-child i:first-child {
  margin-right: -0.25rem;
}

/* Main Content Area */
.main-content {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  background-color: #ffffff;
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  width: 100%;
  min-height: 100vh;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
  }

  .sidebar-collapsed .sidebar {
    width: 60px;
  }

  .sidebar-collapsed .main-content {
    margin-left: 60px;
  }

  .sidebar-title {
    font-size: 0.95rem;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }

  .nav-item {
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }

  .nav-item span {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 200px;
  }

  .main-content {
    margin-left: 200px;
  }

  .sidebar-collapsed .sidebar {
    width: 50px;
  }

  .sidebar-collapsed .main-content {
    margin-left: 50px;
  }

  .user-name,
  .user-role {
    font-size: 0.75rem;
  }

  .action-item {
    font-size: 0.75rem;
    padding: 0.4rem 0.75rem;
  }

  .nav-item span {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 1rem 0.5rem;
  }
}
</style>
