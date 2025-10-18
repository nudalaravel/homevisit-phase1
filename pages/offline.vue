<template>
  <div class="offline-page">
    <div class="offline-container">
      <div class="offline-content">
        <div class="offline-icon">
          <i class="fas fa-wifi-slash"></i>
        </div>
        
        <h1 class="offline-title">คุณอยู่ในโหมดออฟไลน์</h1>
        
        <p class="offline-description">
          ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ในขณะนี้<br>
          คุณยังสามารถใช้งานฟีเจอร์พื้นฐานได้
        </p>
        
        <div class="offline-actions">
          <button 
            class="btn btn-primary"
            @click="goToDashboard"
          >
            <i class="fas fa-tachometer-alt"></i>
            ไปยัง Dashboard
          </button>
          
          <button 
            class="btn btn-outline-secondary"
            @click="retryConnection"
          >
            <i class="fas fa-sync-alt"></i>
            ลองเชื่อมต่อใหม่
          </button>
        </div>
        
        <div class="offline-features">
          <h3>ฟีเจอร์ที่ใช้งานได้ในโหมดออฟไลน์:</h3>
          <ul>
            <li><i class="fas fa-check text-success"></i> ดูข้อมูลที่เคยโหลดมาแล้ว</li>
            <li><i class="fas fa-check text-success"></i> เพิ่ม/แก้ไขข้อมูล (จะซิงค์เมื่อออนไลน์)</li>
            <li><i class="fas fa-check text-success"></i> ใช้งานระบบล็อคอิน</li>
            <li><i class="fas fa-check text-success"></i> ดูรายงานและสถิติ</li>
          </ul>
        </div>
        
        <div class="connection-status">
          <div class="status-indicator" :class="{ 'online': isOnline }">
            <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
            <span>{{ isOnline ? 'เชื่อมต่อแล้ว' : 'ออฟไลน์' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OfflinePage',
  layout: 'default',
  data() {
    return {
      isOnline: navigator.onLine
    }
  },
  mounted() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  },
  beforeDestroy() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  },
  methods: {
    handleOnline() {
      this.isOnline = true
      this.$bvToast.toast('เชื่อมต่อออนไลน์แล้ว', {
        title: 'สถานะการเชื่อมต่อ',
        variant: 'success',
        solid: true
      })
      
      // Redirect to home after a short delay
      setTimeout(() => {
        this.$router.push('/')
      }, 2000)
    },
    
    handleOffline() {
      this.isOnline = false
    },
    
    goToDashboard() {
      this.$router.push('/')
    },
    
    retryConnection() {
      if (navigator.onLine) {
        this.handleOnline()
      } else {
        this.$bvToast.toast('ยังไม่สามารถเชื่อมต่อได้', {
          title: 'ข้อผิดพลาด',
          variant: 'warning',
          solid: true
        })
      }
    }
  }
}
</script>

<style scoped>
.offline-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.offline-container {
  max-width: 600px;
  width: 100%;
}

.offline-content {
  background: white;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
}

.offline-icon {
  font-size: 4rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.offline-title {
  font-size: 2rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.offline-description {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.offline-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.offline-features {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.offline-features h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.offline-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.offline-features li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.offline-features i {
  width: 20px;
  text-align: center;
}

.connection-status {
  margin-top: 2rem;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 500;
  background: #dc3545;
  color: white;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background: #28a745;
}

.status-indicator i {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .offline-page {
    padding: 1rem;
  }
  
  .offline-content {
    padding: 2rem 1.5rem;
  }
  
  .offline-title {
    font-size: 1.5rem;
  }
  
  .offline-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 250px;
  }
}
</style>
