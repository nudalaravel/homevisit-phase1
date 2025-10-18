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

  console.log("Auth middleware: Authentication passed");
}
