import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useSaleStore = defineStore('sale', () => {
  const sales = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all sales
  const fetchSales = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/sales/')
      sales.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch sales'
      console.error('Error fetching sales:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single sale
  const fetchSale = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/sales/${id}/`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch sale'
      console.error('Error fetching sale:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create sale
  const createSale = async (saleData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/sales/', saleData)
      await fetchSales() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create sale'
      console.error('Error creating sale:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update sale
  const updateSale = async (id, saleData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/sales/${id}/`, saleData)
      await fetchSales() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update sale'
      console.error('Error updating sale:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete sale
  const deleteSale = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/sales/${id}/`)
      await fetchSales() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete sale'
      console.error('Error deleting sale:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    sales,
    loading,
    error,
    fetchSales,
    fetchSale,
    createSale,
    updateSale,
    deleteSale
  }
})

