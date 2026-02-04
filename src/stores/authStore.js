import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../utility/axios";

export const useAuthStore = defineStore("auth", () => {
  // State
  const token = ref(localStorage.getItem("token") || null);
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  const register = async (payload) => {
    loading.value = true;
    error.value = null;

    try {
      await api.post("/companies/auth/register/", payload);
      return { ok: true };
    } catch (err) {
      if (
        !err.response?.data?.detail &&
        typeof err.response?.data === "object"
      ) {
        // Field errors; let the page display them
      } else {
        error.value =
          err.response?.data?.detail ||
          "Registration failed. Please check your details.";
      }
      console.error("Register error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post("/token/", credentials);

      // Store token
      token.value = response.data.access;
      localStorage.setItem("token", response.data.access);

      // Store refresh token if provided
      if (response.data.refresh) {
        localStorage.setItem("refresh_token", response.data.refresh);
      }

      // Optionally fetch user details
      await fetchUserDetails();

      return response.data;
    } catch (err) {
      error.value =
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      console.error("Login error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    // Clear state
    token.value = null;
    user.value = null;

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");

    // Clear error
    error.value = null;
  };

  const fetchUserDetails = async () => {
    try {
      // If you have a user endpoint, fetch user details
      // const response = await api.get('/user/me/')
      // user.value = response.data

      // For now, set a basic user object
      user.value = {
        username: "User",
      };
    } catch (err) {
      console.log("User details endpoint not available");
      user.value = { username: "User" };
    }
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      token.value = storedToken;
      fetchUserDetails();
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/token/refresh/", {
        refresh,
      });

      token.value = response.data.access;
      localStorage.setItem("token", response.data.access);

      return response.data.access;
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      throw err;
    }
  };

  // Initialize auth state on store creation
  checkAuth();

  return {
    // State
    token,
    user,
    loading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    register,
    login,
    logout,
    fetchUserDetails,
    checkAuth,
    refreshToken,
  };
});
