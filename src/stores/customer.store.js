import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  // Fetch all customers
  const fetchCustomers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/customers/', { params })
      
      // Handle paginated response
      if (response.data.count !== undefined && params.page && params.page_size) {
        customers.value = response.data.data || []
        pagination.value = {
          currentPage: response.data.page || params.page || 1,
          pageSize: response.data.page_size || params.page_size || 10,
          totalItems: response.data.count || customers.value.length,
          totalPages: response.data.total_pages || Math.ceil((response.data.count || customers.value.length) / (params.page_size || 10))
        }
      } else if (response.data.results) {
        customers.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        // Handle wrapped response
        customers.value = response.data.data || []
        pagination.value.totalItems = customers.value.length
        pagination.value.totalPages = 1
      } else {
        // Handle direct array response
        customers.value = response.data || []
        pagination.value.totalItems = customers.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch customers'
      console.error('Error fetching customers:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single customer
  const fetchCustomer = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/customers/${id}/`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch customer'
      console.error('Error fetching customer:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create customer
  const createCustomer = async (customerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/customers/', customerData)
      await fetchCustomers() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create customer'
      console.error('Error creating customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update customer
  const updateCustomer = async (id, customerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/customers/${id}/`, customerData)
      await fetchCustomers() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update customer'
      console.error('Error updating customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete customer
  const deleteCustomer = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/customers/${id}/`)
      await fetchCustomers() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete customer'
      console.error('Error deleting customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})

