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
        console.log("Clearing offline_auth_data from localStorage");
        localStorage.removeItem("offline_auth_data");
        console.log("offline_auth_data cleared successfully");
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
          // Use $auth.loginWith for Nuxt Auth module
          const result = await app.$auth.loginWith("local", credentials);
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

    // Enhanced logout method - works both online and offline
    async logout() {
      const isOffline = !navigator.onLine;

      console.log(`Logging out... (${isOffline ? "offline" : "online"} mode)`);
      console.log("Before logout - auth state:", {
        loggedIn: store.state.auth?.loggedIn,
        hasUser: !!store.state.auth?.user,
        hasOfflineData: !!localStorage.getItem("offline_auth_data"),
      });

      try {
        // Step 1: Clear Vuex auth state first to prevent middleware issues
        if (store.state.auth) {
          console.log("Clearing Vuex auth state...");
          store.commit("auth/SET", ["loggedIn", false]);
          store.commit("auth/SET", ["user", null]);
          store.commit("auth/SET", ["strategy", null]);
          console.log("Vuex auth state cleared");
        }

        // Step 2: Clear token from auth strategy
        if (store.state.auth?.strategy?.token) {
          try {
            store.state.auth.strategy.token.reset();
          } catch (e) {
            console.log("Token reset skipped:", e.message);
          }
        }

        // Step 3: Clear all auth-related localStorage items
        if (typeof localStorage !== "undefined") {
          console.log("Clearing localStorage auth items...");
          const authItems = [
            "auth._token.local",
            "auth._refresh_token.local",
            "auth.strategy",
            "offline_auth_data",
          ];

          authItems.forEach((item) => {
            try {
              localStorage.removeItem(item);
              console.log(`Removed ${item}`);
            } catch (e) {
              console.warn(`Failed to remove ${item}:`, e);
            }
          });

          console.log("localStorage cleared");
        }

        // Step 4: Verify cleanup
        console.log("After logout - auth state:", {
          loggedIn: store.state.auth?.loggedIn,
          hasUser: !!store.state.auth?.user,
          hasOfflineData: !!localStorage.getItem("offline_auth_data"),
        });

        // Step 5: Small delay to ensure all operations complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("Logout successful - redirecting to login");

        // Step 6: Redirect to login page with success query param
        if (app.router) {
          return app.router.push({
            path: "/login",
            query: { logout: "success" },
          });
        }

        return true;
      } catch (error) {
        console.error("Error during logout:", error);
        // Even if there's an error, try to redirect to login
        if (app.router) {
          return app.router.push("/login");
        }
        throw error;
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
