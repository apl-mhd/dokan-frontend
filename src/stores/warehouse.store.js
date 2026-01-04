import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all warehouses
  const fetchWarehouses = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/warehouses/')
      warehouses.value = response.data || []
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
    fetchWarehouses,
    fetchWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
  }
})

