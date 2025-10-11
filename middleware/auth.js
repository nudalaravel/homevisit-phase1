export default function ({ store, redirect, route }) {
  // Skip middleware on server-side
  if (process.server) {
    return;
  }

  // Skip middleware for login page to prevent redirect loop
  if (route.path === "/login") {
    return;
  }

  // Check if auth module is ready
  if (!store.state.auth) {
    console.log("Auth middleware: auth module not ready");
    return redirect("/login");
  }

  // Check if user is authenticated
  const isAuthenticated = store.state.auth.loggedIn;
  const hasUser = !!store.state.auth.user;

  console.log("Auth middleware:", {
    route: route.path,
    isAuthenticated,
    hasUser,
    hasAuthState: !!store.state.auth,
  });

  // If not authenticated or no user data, redirect to login
  if (!isAuthenticated || !hasUser) {
    console.log(
      "Auth middleware: Not authenticated or no user data, redirecting to login"
    );
    return redirect("/login");
  }

  // Additional check: If authenticated but no offline auth data,
  // this might indicate a logout in progress or corrupted state
  if (process.client) {
    const hasOfflineData = localStorage.getItem("offline_auth_data");
    if (!hasOfflineData) {
      console.log(
        "Auth middleware: No offline data found, clearing auth state"
      );
      // Clear auth state completely
      store.commit("auth/SET", ["loggedIn", false]);
      store.commit("auth/SET", ["user", null]);
      store.commit("auth/SET", ["strategy", null]);

      // Clear any remaining auth tokens
      try {
        localStorage.removeItem("auth._token.local");
        localStorage.removeItem("auth._refresh_token.local");
        localStorage.removeItem("auth.strategy");
      } catch (e) {
        console.warn("Failed to clear auth tokens:", e);
      }

      return redirect("/login");
    }
  }

  console.log("Auth middleware: Authentication passed");
}
