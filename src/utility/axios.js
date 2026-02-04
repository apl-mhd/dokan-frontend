import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (more reliable than store in interceptor)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry auth endpoints on 401 (would cause infinite loop)
    const isAuthEndpoint = originalRequest.url?.includes("/token/");
    // If 401 and not already retried, try to refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const { useAuthStore } = await import("../stores/authStore");
        const authStore = useAuthStore();
        const newToken = await authStore.refreshToken();

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        const { useAuthStore } = await import("../stores/authStore");
        const authStore = useAuthStore();
        authStore.logout();

        // SPA redirect to login (avoid full page reload)
        if (window.location.pathname !== "/login") {
          const { default: router } = await import("../router");
          router.push("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
