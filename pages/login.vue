<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img src="/logo.png" alt="Logo" class="logo-img" />
          </div>
         
      
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">ชื่อผู้ใช้</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.username }"
              placeholder="กรอกชื่อผู้ใช้"
              autocomplete="username"
              required
            />
            <div v-if="errors.username" class="invalid-feedback">
              {{ errors.username }}
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">รหัสผ่าน</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              placeholder="กรอกรหัสผ่าน"
              autocomplete="current-password"
              required
            />
            <div v-if="errors.password" class="invalid-feedback">
              {{ errors.password }}
            </div>
          </div>

              <OnlineStatus />

          <StorageStatus />

          <button
            type="submit"
            class="btn btn-primary btn-lg login-btn"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sign-in-alt"></i>
            {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>

        <div class="login-footer">
          <div class="demo-credentials">
            <h4>ข้อมูลสำหรับทดสอบ:</h4>
            <div class="credential-item">
              <strong>ผู้ดูแลระบบ:</strong> admin / admin123
            </div>
            <div class="credential-item">
              <strong>ผู้ใช้ทั่วไป:</strong> user / user123
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'default',
  auth: false,
  data() {
    return {
      form: {
        username: '',
        password: '',
        remember: false
      },
      errors: {},
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.errors = {}
      this.loading = true

      try {
        // Use offline auth manager for enhanced login
        await this.$offlineAuth.login({
          username: this.form.username,
          password: this.form.password
        })

        this.$router.push('/dashboard')
      } catch (error) {
        console.error('Login error:', error)
        this.errors = {
          username: error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
 background: linear-gradient(135deg, #e2e2e2 0%, #ffffff 100%);
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-img {
  width: 150px;
  margin-right: 0.75rem;
  object-fit: contain;
}

.logo h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.login-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.login-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #3551a4;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6c757d;
  cursor: pointer;
}

.form-checkbox {
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
}

.login-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(53, 81, 164, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn i {
  margin-right: 0.5rem;
}

.login-footer {
  padding: 1rem 2rem 2rem;
  background-color: #f8f9fa;
}

.demo-credentials {
  text-align: center;
}

.demo-credentials h4 {
  margin-bottom: 1rem;
  color: #495057;
  font-size: 1rem;
}

.credential-item {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.credential-item strong {
  color: #495057;
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .login-form {
    padding: 1.5rem;
  }
  
  .login-footer {
    padding: 1rem 1.5rem 1.5rem;
  }
}
</style>

