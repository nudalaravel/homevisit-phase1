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
        <!--nuxt-link
          to="/supervisor-booking"
          class="nav-item"
          :class="{ active: isActiveRoute('supervisor-booking') }"
          :title="sidebarCollapsed ? 'ยืนยันการเยี่ยมบ้าน' : ''"
        >
          <i class="fas fa-clipboard-check"></i>
          <span v-if="!sidebarCollapsed">ยืนยันการเยี่ยมบ้าน</span>
        </nuxt-link-->
        <div class="nav-group">
          <div
            class="nav-item nav-parent"
            :class="{ active: isBookingMenuActive }"
            :title="sidebarCollapsed ? 'ยืนยันการเยี่ยมบ้าน' : ''"
            @click="toggleBookingMenu"
          >
            <div class="d-flex align-items-center gap-2">
              <i class="fas fa-clipboard-check"></i>
              <span v-if="!sidebarCollapsed" class="ml-2">ยืนยันการเยี่ยมบ้าน</span>
            </div>
            <i
              v-if="!sidebarCollapsed"
              class="fas"
              :class="showBookingSubmenu ? 'fa-chevron-down' : 'fa-chevron-right'"
            ></i>
          </div>

          <div v-show="showBookingSubmenu && !sidebarCollapsed" class="sub-nav">
            <nuxt-link
              to="/supervisor-booking-pending"
              class="nav-item sub-item"
              :class="{ active: isActiveRoute('supervisor-booking-pending') }"
            >
              <i class="fas fa-hourglass-half"></i>
              <span>รออนุมัติ</span>
            </nuxt-link>

            <nuxt-link
              to="/supervisor-booking-approved"
              class="nav-item sub-item"
              :class="{ active: isActiveRoute('supervisor-booking-approved') }"
            >
              <i class="fas fa-check-circle"></i>
              <span>อนุมัติแล้ว</span>
            </nuxt-link>
          </div>
        </div>
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

      <!-- Switch Back to Admin (only for admin users who switched) -->
      <div v-if="isAdminSwitched" class="switch-mode-section">
        <div class="switch-mode-btn" @click="switchToAdmin" :title="sidebarCollapsed ? 'กลับไปหน้า Admin' : ''">
          <i class="fas fa-exchange-alt"></i>
          <span v-if="!sidebarCollapsed">กลับไปหน้า Admin</span>
        </div>
      </div>
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
      sidebarCollapsed: false,
      isAdminSwitched: false,
      showBookingSubmenu: false
    }
  },
  computed: {
    buildVersion() {
      return process.env.BUILD_VERSION || '0.0.0'
    },
    isBookingMenuActive() {
      return this.$route.path.startsWith('/supervisor-booking')
    }
  },
  beforeMount() {
    // Check if already authenticated, redirect based on user level
    if (process.client) {
      const isAuthenticated = this.$store.state.auth?.loggedIn
      if (isAuthenticated) {
        const user = this.$store.state.auth?.user
        const userLevel = user?.level
        
        if (userLevel === 3) {
          console.log('Already authenticated (Level 3), redirecting to home')
          this.$router.push('/')
        }
      }
    }
  },
  mounted() {
    this.loadSidebarState()
    // ตรวจสอบว่าเป็น admin ที่สลับโหมดมาหรือไม่
    if (process.client) {
      this.isAdminSwitched = localStorage.getItem('admin_active_mode') === 'supervisor'
    }
    if (this.$route.path.startsWith('/supervisor-booking')) {
      this.showBookingSubmenu = true
    }
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
          localStorage.removeItem('admin_active_mode')
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
    },
    switchToAdmin() {
      localStorage.removeItem('admin_active_mode')
      this.$router.push('/admin-payment')
    },
    toggleBookingMenu() {
      if (this.sidebarCollapsed) {
        return this.$router.push('/supervisor-booking-pending')
      }
      this.showBookingSubmenu = !this.showBookingSubmenu
    },
    isActiveRoute(route) {
      return this.$route.path === `/${route}` || this.$route.path === route
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
  top: 10px;
  right: -15px;
    width: 30px;
    height: 70px;
    border-radius: 6px;
  background: #3551a4;
  border: 2px solid white;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  z-index: 1001;
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

/* Switch Mode Section */
.switch-mode-section {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.switch-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 0.5rem;
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.15s;
}

.switch-mode-btn:hover {
  background-color: rgba(255, 215, 0, 0.15);
}

.switch-mode-btn i {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.sidebar-collapsed .switch-mode-btn {
  justify-content: center;
  padding: 0.75rem 0.5rem;
  gap: 0;
}

/* ===== SUB MENU (SAFE ADD-ON) ===== */

.nav-group {
  width: 100%;
}

/* parent menu */
.nav-parent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

/* submenu container */
.sub-nav {
  display: flex;
  flex-direction: column;
  margin-left: 1.5rem;
  margin-top: 0.25rem;
}

/* submenu item */
.sub-item {
  font-size: 0.9rem;
  padding: 0.6rem 1rem;
  padding-left: 2.5rem; /* 👈 เยื้องเข้า */
  opacity: 0.9;
}

/* hover */
.sub-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

/* active submenu */
.sub-item.active {
  background-color: rgba(255, 255, 255, 0.15);
  border-left: 3px solid #87ceeb;
}

/* ===== COLLAPSED MODE ===== */

.sidebar-collapsed .sub-nav {
  display: none; /* 👈 ซ่อน submenu เลย */
}

/* ===== MOBILE ===== */

@media (max-width: 768px) {
  .sub-nav {
    margin-left: 1rem;
  }

  .sub-item {
    font-size: 0.85rem;
    padding-left: 2rem;
  }
}

@media (max-width: 480px) {
  .sub-nav {
    margin-left: 0.5rem;
  }

  .sub-item {
    padding-left: 1.5rem;
    font-size: 0.8rem;
  }
}
</style>
