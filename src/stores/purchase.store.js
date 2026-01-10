import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../utility/axios";

// Purchase Store
export const usePurchaseStore = defineStore("purchase", () => {
  const purchases = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Fetch all purchases
  const fetchPurchases = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get("/purchases/", { params });

      // Handle paginated response
      if (response.data.results) {
        purchases.value = response.data.results;
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil(
            (response.data.count || 0) / (params.page_size || 10)
          ),
        };
      } else if (response.data.data) {
        // Handle wrapped response
        purchases.value = response.data.data || [];
        pagination.value.totalItems = purchases.value.length;
        pagination.value.totalPages = 1;
      } else {
        // Handle direct array response
        purchases.value = response.data || [];
        pagination.value.totalItems = purchases.value.length;
        pagination.value.totalPages = 1;
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to fetch purchases";
      console.error("Error fetching purchases:", err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch single purchase
  const fetchPurchase = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/purchases/${id}/`);
      return response.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to fetch purchase";
      console.error("Error fetching purchase:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Create purchase
  const createPurchase = async (purchaseData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post("/purchases/", purchaseData);
      await fetchPurchases(); // Refresh list
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to create purchase";
      console.error("Error creating purchase:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update purchase
  const updatePurchase = async (id, purchaseData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put(`/purchases/${id}/`, purchaseData);
      await fetchPurchases(); // Refresh list
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update purchase";
      console.error("Error updating purchase:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete purchase
  const deletePurchase = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/purchases/${id}/`);
      await fetchPurchases(); // Refresh list
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete purchase";
      console.error("Error deleting purchase:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    purchases,
    loading,
    error,
    pagination,
    fetchPurchases,
    fetchPurchase,
    createPurchase,
    updatePurchase,
    deletePurchase,
  };
});
