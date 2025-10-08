export default function ({ app, store }, inject) {
  // Offline Authentication Manager
  class OfflineAuthManager {
    constructor() {
      this.setupAuthListeners();
    }

    setupAuthListeners() {
      // Wait for auth module to be ready
      const checkAuthModule = () => {
        if (store.state.auth) {
          // Listen for auth state changes
          store.watch(
            (state) => state.auth.loggedIn,
            (loggedIn) => {
              if (loggedIn) {
                this.saveAuthData();
              } else {
                this.clearAuthData();
              }
            }
          );
        } else {
          // Retry after a short delay
          setTimeout(checkAuthModule, 100);
        }
      };

      checkAuthModule();
    }

    // Save authentication data for offline access
    saveAuthData() {
      try {
        if (!store.state.auth) return;

        const authData = {
          user: store.state.auth.user,
          token: store.state.auth.strategy?.token?.get() || null,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("offline_auth_data", JSON.stringify(authData));
      } catch (error) {
        console.error("Failed to save auth data:", error);
      }
    }

    // Load authentication data for offline access
    loadAuthData() {
      try {
        const saved = localStorage.getItem("offline_auth_data");
        if (saved) {
          const authData = JSON.parse(saved);

          // Check if token is still valid (1 year)
          const tokenAge = Date.now() - new Date(authData.timestamp).getTime();
          const oneYear = 365 * 24 * 60 * 60 * 1000;

          if (tokenAge < oneYear) {
            return authData;
          } else {
            this.clearAuthData();
            return null;
          }
        }
      } catch (error) {
        console.error("Failed to load auth data:", error);
        this.clearAuthData();
      }
      return null;
    }

    // Clear authentication data
    clearAuthData() {
      try {
        localStorage.removeItem("offline_auth_data");
      } catch (error) {
        console.error("Failed to clear auth data:", error);
      }
    }

    // Check if user can login offline
    canLoginOffline() {
      const authData = this.loadAuthData();
      return authData !== null;
    }

    // Login offline using saved data
    async loginOffline() {
      const authData = this.loadAuthData();
      if (!authData) {
        throw new Error("No offline authentication data available");
      }

      try {
        if (!store.state.auth) {
          throw new Error("Auth module not ready");
        }

        // Set auth state without making network request
        store.commit("auth/SET", ["loggedIn", true]);
        store.commit("auth/SET", ["user", authData.user]);
        store.commit("auth/SET", ["strategy", "local"]);

        // Set token in auth strategy
        if (store.state.auth.strategy && store.state.auth.strategy.token) {
          store.state.auth.strategy.token.set(authData.token);
        }

        return true;
      } catch (error) {
        console.error("Offline login failed:", error);
        throw error;
      }
    }

    // Enhanced login method that works both online and offline
    async login(credentials) {
      if (navigator.onLine) {
        // Online login
        try {
          const result = await store.dispatch("auth/login", credentials);
          this.saveAuthData();
          return result;
        } catch (error) {
          throw error;
        }
      } else {
        // Offline login - check if we have valid saved data
        if (this.canLoginOffline()) {
          return await this.loginOffline();
        } else {
          throw new Error(
            "ไม่สามารถเข้าสู่ระบบได้ในโหมดออฟไลน์ กรุณาเชื่อมต่ออินเทอร์เน็ต"
          );
        }
      }
    }

    // Enhanced logout method
    async logout() {
      try {
        // Clear offline data first
        this.clearAuthData();

        // Then logout from auth system
        if (navigator.onLine) {
          await store.dispatch("auth/logout");
        } else {
          // Offline logout - just clear local state
          store.commit("auth/SET", ["loggedIn", false]);
          store.commit("auth/SET", ["user", null]);
        }
      } catch (error) {
        console.error("Logout failed:", error);
        // Force clear local state even if logout fails
        store.commit("auth/SET", ["loggedIn", false]);
        store.commit("auth/SET", ["user", null]);
        this.clearAuthData();
      }
    }

    // Check authentication status
    getAuthStatus() {
      return {
        isLoggedIn: store.state.auth?.loggedIn || false,
        user: store.state.auth?.user || null,
        canLoginOffline: this.canLoginOffline(),
        isOnline: navigator.onLine,
      };
    }
  }

  // Create offline auth manager instance
  const offlineAuth = new OfflineAuthManager();

  // Inject into Vue instance
  inject("offlineAuth", offlineAuth);

  // Initialize offline auth on app start
  if (process.client) {
    // Wait for auth module to be ready before trying to restore auth
    const initializeOfflineAuth = () => {
      if (store.state.auth) {
        // Try to restore authentication state on app start
        if (!store.state.auth.loggedIn && offlineAuth.canLoginOffline()) {
          offlineAuth.loginOffline().catch((error) => {
            console.error("Failed to restore offline auth:", error);
          });
        }
      } else {
        // Retry after a short delay
        setTimeout(initializeOfflineAuth, 100);
      }
    };

    initializeOfflineAuth();
  }
}
