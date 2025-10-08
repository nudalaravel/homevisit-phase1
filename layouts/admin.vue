<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div v-if="!sidebarCollapsed" class="logo-container">
          <img src="/logo.png" alt="Logo" class="logo-img" />
          <h3>Riped Admin</h3>
        </div>
        <img v-else src="/logo.png" alt="Logo" class="logo-img-small" />
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li>
            <nuxt-link to="/dashboard" class="nav-link" active-class="active">
              <i class="fas fa-tachometer-alt"></i>
              <span v-if="!sidebarCollapsed">แดชบอร์ด</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/users" class="nav-link" active-class="active">
              <i class="fas fa-users"></i>
              <span v-if="!sidebarCollapsed">ผู้ใช้</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/orders" class="nav-link" active-class="active">
              <i class="fas fa-shopping-cart"></i>
              <span v-if="!sidebarCollapsed">คำสั่งซื้อ</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/products" class="nav-link" active-class="active">
              <i class="fas fa-box"></i>
              <span v-if="!sidebarCollapsed">สินค้า</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/settings" class="nav-link" active-class="active">
              <i class="fas fa-cog"></i>
              <span v-if="!sidebarCollapsed">การตั้งค่า</span>
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content" :class="{ expanded: sidebarCollapsed }">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        
        <div class="header-right">
          <OnlineStatus />
          <div class="user-menu">
            <div class="user-info">
              <span class="user-name">{{ $auth?.user?.name || 'ผู้ดูแลระบบ' }}</span>
              <span class="user-role">{{ $auth?.user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป' }}</span>
            </div>
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="dropdown-menu">
              <a href="#" @click.prevent="logout">ออกจากระบบ</a>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  computed: {
    pageTitle() {
      const route = this.$route.name
      switch (route) {
        case 'dashboard': return 'แดชบอร์ด'
        case 'users': return 'จัดการผู้ใช้'
        case 'orders': return 'จัดการคำสั่งซื้อ'
        case 'products': return 'จัดการสินค้า'
        case 'settings': return 'การตั้งค่า'
        default: return 'แผงควบคุม'
      }
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    async logout() {
      await this.$offlineAuth.logout()
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
    background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  color: white;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.logo-img {
  width: 40px;
  height: 40px;
  margin-bottom: 0.5rem;
  object-fit: contain;
}

.logo-img-small {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border-left-color: #3551a4;
}

.nav-link i {
  width: 20px;
  margin-right: 0.75rem;
  text-align: center;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: 70px;
}

.top-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  margin-right: 1rem;
  cursor: pointer;
  color: #6c757d;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.user-menu {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.user-info {
  text-align: right;
  margin-right: 0.75rem;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #2c3e50;
}

.user-role {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: capitalize;
}

.user-avatar {
  font-size: 2rem;
  color: #6c757d;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  min-width: 150px;
  display: none;
}

.user-menu:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  display: block;
  padding: 0.75rem 1rem;
  color: #6c757d;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.dropdown-menu a:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.page-content {
  padding: 2rem;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .main-content.expanded {
    margin-left: 0;
  }
}
</style>

