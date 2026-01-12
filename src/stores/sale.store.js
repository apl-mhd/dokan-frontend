import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useSaleStore = defineStore('sale', () => {
  const sales = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  // Fetch all sales
  const fetchSales = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/sales/', { params })
      
      // Handle paginated response
      if (response.data.results) {
        sales.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        // Handle wrapped response with pagination metadata
        sales.value = response.data.data || []
        if (response.data.count !== undefined && params.page && params.page_size) {
          // Paginated response with metadata
          pagination.value = {
            currentPage: response.data.page || params.page || 1,
            pageSize: response.data.page_size || params.page_size || 10,
            totalItems: response.data.count || sales.value.length,
            totalPages: response.data.total_pages || Math.ceil((response.data.count || sales.value.length) / (params.page_size || 10))
          }
        } else {
          // Non-paginated wrapped response
        pagination.value.totalItems = sales.value.length
        pagination.value.totalPages = 1
        }
      } else {
        // Handle direct array response
        sales.value = response.data || []
        pagination.value.totalItems = sales.value.length
        pagination.value.totalPages = 1
      }
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
    pagination,
    fetchSales,
    fetchSale,
    createSale,
    updateSale,
    deleteSale
  }
})

