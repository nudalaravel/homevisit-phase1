<template>
  <div class="login-page">
    <Loading :show="loading" :message="loadingMessage" />
    
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img src="/homevisit/logo.png" alt="Logo" class="logo-img" />
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <div class="form-group">
            <label for="username" class="form-label">
              ชื่อผู้ใช้ <span class="text-danger">*</span>
            </label>
            <input
              id="username"
              v-model.trim="form.username"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.username || submitted && !form.username }"
              placeholder="กรอกชื่อผู้ใช้"
              autocomplete="username"
              @input="clearError('username')"
              @blur="validateUsername"
            />
            <div v-if="errors.username" class="invalid-feedback">
              {{ errors.username }}
            </div>
            <div v-else-if="submitted && !form.username" class="invalid-feedback">
              กรุณากรอกชื่อผู้ใช้
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              รหัสผ่าน <span class="text-danger">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.password || submitted && !form.password }"
                placeholder="กรอกรหัสผ่าน"
                autocomplete="current-password"
                @input="clearError('password')"
                @blur="validatePassword"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.password" class="invalid-feedback">
              {{ errors.password }}
            </div>
            <div v-else-if="submitted && !form.password" class="invalid-feedback">
              กรุณากรอกรหัสผ่าน
            </div>
          </div>

        


          <div v-if="generalError" class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-circle"></i>
            {{ generalError }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg login-btn"
            :disabled="loading || isFormInvalid"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sign-in-alt"></i>
            {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>
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
      generalError: '',
      loading: false,
      loadingMessage: 'กำลังเข้าสู่ระบบ...',
      submitted: false,
      showPassword: false
    }
  },
  computed: {
    isFormInvalid() {
      return !this.form.username || !this.form.password || this.form.username.length < 1 || this.form.password.length < 1
    }
  },
  beforeMount() {
    // Check if already authenticated, redirect based on user level
    if (process.client) {
      const isAuthenticated = this.$store.state.auth?.loggedIn
      if (isAuthenticated) {
        const user = this.$store.state.auth?.user
        const userLevel = user?.level
        
        if (userLevel === 1) {
          console.log('Already authenticated (Level 1), redirecting to admin-payment')
          this.$router.push('/admin-payment')
        } else if (userLevel === 2) {
          console.log('Already authenticated (Level 2), redirecting to supervisor dashboard')
          this.$router.push('/supervisor-dashboard')
        } else if (userLevel === 3) {
          console.log('Already authenticated (Level 3), redirecting to home')
          this.$router.push('/')
        } else {
          console.warn('Invalid user level:', userLevel, '- staying on login page')
        }
      }
    }
  },
  mounted() {
    // Show logout success message if coming from logout
    if (process.client && this.$route.query.logout === 'success') {
      // Use custom toast instead of Bootstrap Vue toast
      setTimeout(() => {
        this.$toast.success('ออกจากระบบสำเร็จ')
      }, 300)
      // Remove query parameter
      this.$router.replace({ query: {} })
    }
  },
  methods: {
    validateUsername() {
      if (!this.form.username || this.form.username.trim() === '') {
        this.errors.username = 'กรุณากรอกชื่อผู้ใช้'
        return false
      }
      delete this.errors.username
      return true
    },
    validatePassword() {
      if (!this.form.password) {
        this.errors.password = 'กรุณากรอกรหัสผ่าน'
        return false
      }
      if (this.form.password.length < 2) {
        this.errors.password = 'รหัสผ่านต้องมีอย่างน้อย 2 ตัวอักษร'
        return false
      }
      delete this.errors.password
      return true
    },
    validateForm() {
      this.errors = {}
      this.generalError = ''
      
      const usernameValid = this.validateUsername()
      const passwordValid = this.validatePassword()
      
      return usernameValid && passwordValid
    },
    clearError(field) {
      if (this.errors[field]) {
        delete this.errors[field]
      }
      if (this.generalError) {
        this.generalError = ''
      }
    },
    async handleLogin() {
      this.submitted = true
      this.generalError = ''
      
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      this.loadingMessage = 'กำลังตรวจสอบข้อมูล...'

      try {
        // Check if we're online or offline
        if (!navigator.onLine) {
          this.loadingMessage = 'กำลังเข้าสู่ระบบในโหมดออฟไลน์...'
        }

        // Use offline auth manager for enhanced login
        await this.$offlineAuth.login({
          username: this.form.username,
          password: this.form.password
        })

        this.loadingMessage = 'เข้าสู่ระบบสำเร็จ!'
        
        // Show success message
        this.$toast.success('เข้าสู่ระบบสำเร็จ')

        // Get user level and redirect accordingly
        // Wait a bit to ensure user data is set in store
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Try multiple sources to get user data
        let user = this.$store.state.auth?.user;
        let userLevel = user?.level;
        
        // Debug logging
        console.log("Login - User data check:", {
          storeUser: this.$store.state.auth?.user,
          storeUserLevel: this.$store.state.auth?.user?.level,
          offlineUser: this.$offlineAuth?.getUser(),
          offlineUserLevel: this.$offlineAuth?.getUser()?.level
        });
        
        // If level is undefined, try offline auth
        if (userLevel === undefined) {
          const offlineUser = this.$offlineAuth?.getUser();
          if (offlineUser && offlineUser.level !== undefined) {
            user = offlineUser;
            userLevel = offlineUser.level;
            console.log("Login: Got user level from offline auth:", userLevel);
          }
        }
        
        // If still undefined, try localStorage
        if (userLevel === undefined && process.client) {
          try {
            const authDataStr = localStorage.getItem("offline_auth_data");
            if (authDataStr) {
              const authData = JSON.parse(authDataStr);
              if (authData && authData.user && authData.user.level !== undefined) {
                user = authData.user;
                userLevel = authData.user.level;
                console.log("Login: Got user level from localStorage:", userLevel);
                
                // Update store if needed
                if (!this.$store.state.auth?.user || !this.$store.state.auth.user.level) {
                  this.$store.commit("auth/SET", ["user", authData.user]);
                }
              }
            }
          } catch (e) {
            console.error("Login: Error reading from localStorage:", e);
          }
        }

        // Validate user level
        if (userLevel !== 1 && userLevel !== 2 && userLevel !== 3) {
          console.error('Invalid user level:', userLevel, 'User:', user);
          this.$toast.error('ระดับผู้ใช้ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ')
          return
        }

        // Wait a bit before redirecting
        setTimeout(() => {
          if (userLevel === 1) {
            // Level 1 users (Admin) - go to admin-payment
            console.log('Level 1 user login: Redirecting to admin-payment')
            this.$router.push('/admin-payment')
          } else if (userLevel === 2) {
            // Level 2 users (Supervisor) - STRICTLY go to supervisor dashboard only
            console.log('Level 2 user login: Redirecting to supervisor dashboard')
            this.$router.push('/supervisor-dashboard')
          } else if (userLevel === 3) {
            // Level 3 users (Home Visitor) - go to home page
            console.log('Level 3 user login: Redirecting to home page')
            this.$router.push('/')
          }
        }, 500)

      } catch (error) {
        console.error('Login error:', error)
        
        let errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        
        if (error.response) {
          // API error response
          if (error.response.status === 401) {
            errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
          } else if (error.response.status === 500) {
            errorMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง'
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        this.generalError = errorMessage
        
        // Show error toast
        this.$toast.error(errorMessage)
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
  max-width: 450px;
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
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-img {
  width: 150px;
  object-fit: contain;
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
  font-weight: 500;
  color: #495057;
}

.text-danger {
  color: #dc3545;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  height: 50px;
}

.form-control:focus {
  border-color: #3551a4;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .form-control {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #3551a4;
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
  margin-bottom: 0;
}

.form-checkbox {
  margin-right: 0.5rem;
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
}

.alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.alert i {
  margin-right: 0.5rem;
}

.login-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  color: white;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  font-weight: 500;
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
  
  .logo-img {
    width: 120px;
  }
}
</style>
