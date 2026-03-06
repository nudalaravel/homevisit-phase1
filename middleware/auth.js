export default function ({ store, redirect, route, app }) {
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
    console.log("Auth middleware: Not authenticated or no user data, redirecting to login");
    return redirect("/login");
  }

  // Get user level - must be explicitly 1, 2, or 3
  // Try multiple sources to get user data
  let user = store.state.auth?.user;
  let userLevel = user?.level;

  // If user level is undefined, try to get from multiple sources
  if (userLevel === undefined && process.client) {
    try {
      // Try 1: Get from offline auth if available
      if (app && app.$offlineAuth) {
        const offlineUser = app.$offlineAuth.getUser();
        if (offlineUser && offlineUser.level !== undefined) {
          user = offlineUser;
          userLevel = offlineUser.level;
          console.log("Auth middleware: Got user level from offline auth:", userLevel);
        }
      }

      // Try 2: Get from localStorage directly
      if (userLevel === undefined) {
        try {
          const authDataStr = localStorage.getItem("offline_auth_data");
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            if (authData && authData.user && authData.user.level !== undefined) {
              user = authData.user;
              userLevel = authData.user.level;
              console.log("Auth middleware: Got user level from localStorage:", userLevel);
              
              // Update store if user data is missing
              if (!store.state.auth?.user && user) {
                store.commit("auth/SET", ["user", user]);
              }
            }
          }
        } catch (e) {
          console.error("Error reading from localStorage:", e);
        }
      }
    } catch (error) {
      console.error("Error getting user from alternative sources:", error);
    }
  }

  // Debug logging
  console.log("Auth middleware - User data:", {
    hasUser: !!user,
    user: user,
    userLevel: userLevel,
    userLevelType: typeof userLevel,
    authState: store.state.auth ? {
      loggedIn: store.state.auth.loggedIn,
      hasUser: !!store.state.auth.user,
      userKeys: store.state.auth.user ? Object.keys(store.state.auth.user) : []
    } : null
  });

  // Validate user level - must be number 1, 2, or 3
  if (userLevel !== 1 && userLevel !== 2 && userLevel !== 3) {
    console.error("Auth middleware: Invalid or missing user level:", userLevel, "User:", user);
    return redirect("/login");
  }

  // Check route path for different page types
  // In hash mode, route.path contains the actual path (e.g., "/supervisor-dashboard")
  const currentPath = (route.path || "").toLowerCase();
  const isSupervisorPage = currentPath.includes("supervisor-");
  const isAdminPage = currentPath.includes("admin-");
  const isLevel3Page = currentPath === "/" || currentPath === "/survey";

  // Level-based routing logic - STRICT separation
  if (userLevel === 1) {
    // Level 1 users (Admin) - can access admin pages OR supervisor pages when in supervisor mode
    const activeMode = process.client ? localStorage.getItem('admin_active_mode') : null
    
    if (activeMode === 'supervisor') {
      // Admin in supervisor mode - allow supervisor pages, block level 3 pages
      if (!isSupervisorPage && !isAdminPage) {
        console.log(
          "Auth middleware: Level 1 user in supervisor mode accessing level 3 page, redirecting to supervisor-dashboard"
        );
        return redirect("/supervisor-dashboard");
      }
    } else {
      // Admin in normal mode - STRICTLY admin pages only
      if (!isAdminPage) {
        console.log(
          "Auth middleware: Level 1 user attempting to access non-admin page, redirecting to admin-payment"
        );
        return redirect("/admin-payment");
      }
    }
  } else if (userLevel === 2) {
    // Level 2 users (Supervisor) - STRICTLY can only access supervisor pages
    // Block all level 3 pages and admin pages
    if (!isSupervisorPage) {
      console.log(
        "Auth middleware: Level 2 user attempting to access level 3 or admin page, redirecting to supervisor dashboard"
      );
      return redirect("/supervisor-dashboard");
    }
  } else if (userLevel === 3) {
    // Level 3 users (Home Visitor) - STRICTLY can only access level 3 pages
    // Block all supervisor and admin pages
    if (isSupervisorPage || isAdminPage) {
      console.log("Auth middleware: Level 3 user attempting to access supervisor or admin page, redirecting to home");
      return redirect("/");
    }
  }

  console.log("Auth middleware: Authentication passed");
}
