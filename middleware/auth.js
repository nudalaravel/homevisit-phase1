export default function ({ store, redirect, route, $offline }) {
  // Check if auth module is ready
  if (!store.state.auth) {
    return;
  }

  // Check if user is authenticated
  const isAuthenticated = store.state.auth.loggedIn;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return redirect("/login");
  }

  // If offline and trying to access login page, redirect to dashboard
  if (route.path === "/login" && !navigator.onLine) {
    return redirect("/dashboard");
  }

  // If online and authenticated, ensure token is valid
  if (navigator.onLine && isAuthenticated) {
    // Check if token exists in localStorage for offline access
    const token = localStorage.getItem("auth._token.local");
    if (!token) {
      // Token not found, logout user
      store.dispatch("auth/logout");
      return redirect("/login");
    }
  }
}
