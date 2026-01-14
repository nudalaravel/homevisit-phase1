<template>
  <div class="homevisitor-layout">
    <!-- Header Bar -->
    <header class="header-bar">
      <div class="header-content">
        <div class="header-left">
          <img src="/homevisit/logo.png" alt="Logo" class="header-logo" />
          <h1 class="header-title">ระบบบันทึกการเยี่ยมบ้าน</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <i class="fas fa-user-circle"></i>
            <span class="user-name">{{ getUserName() }}</span>
          </div>
          <button class="btn-logout" @click="logout">
            <i class="fas fa-power-off"></i>
            <span>ออกจากระบบ</span>
          </button>
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
  methods: {
    getUserName() {
      if (this.$store.state.auth?.user) {
        return this.$store.state.auth.user.name || this.$store.state.auth.user.username || 'ผู้ใช้'
      }
      if (this.$offlineAuth) {
        const user = this.$offlineAuth.getUser()
        return user?.name || user?.username || 'ผู้ใช้'
      }
      return 'ผู้ใช้'
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
  background-color: #f5f5f5;
}

/* Header Bar */
.header-bar {
  background: #3551a4;
  color: white;
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-logo {
  height: 40px;
  width: auto;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.user-info i {
  font-size: 1.25rem;
}

.user-name {
  color: white;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.25);
}

.btn-logout i {
  font-size: 0.9rem;
}

/* Main Content Area */
.main-content {
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: #ffffff;
}

.content-wrapper {
  width: 100%;
  min-height: calc(100vh - 60px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-bar {
    padding: 0.5rem 1rem;
  }

  .header-title {
    font-size: 1rem;
  }

  .header-logo {
    height: 32px;
  }

  .user-name {
    display: none;
  }

  .btn-logout span {
    display: none;
  }

  .btn-logout {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 0.9rem;
  }

  .header-logo {
    height: 28px;
  }
}
</style>
