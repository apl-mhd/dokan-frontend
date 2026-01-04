import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  // Fetch all warehouses
  const fetchWarehouses = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/warehouses/', { params })
      
      // Handle paginated response
      if (response.data.results) {
        warehouses.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        warehouses.value = response.data.data || []
        pagination.value.totalItems = warehouses.value.length
        pagination.value.totalPages = 1
      } else {
        warehouses.value = response.data || []
        pagination.value.totalItems = warehouses.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch warehouses'
      console.error('Error fetching warehouses:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single warehouse
  const fetchWarehouse = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/warehouses/${id}/`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch warehouse'
      console.error('Error fetching warehouse:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create warehouse
  const createWarehouse = async (warehouseData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/warehouses/', warehouseData)
      await fetchWarehouses() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create warehouse'
      console.error('Error creating warehouse:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update warehouse
  const updateWarehouse = async (id, warehouseData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/warehouses/${id}/`, warehouseData)
      await fetchWarehouses() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update warehouse'
      console.error('Error updating warehouse:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete warehouse
  const deleteWarehouse = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/warehouses/${id}/`)
      await fetchWarehouses() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete warehouse'
      console.error('Error deleting warehouse:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    warehouses,
    loading,
    error,
    pagination,
    fetchWarehouses,
    fetchWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
  }
})

