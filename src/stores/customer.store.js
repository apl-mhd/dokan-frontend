import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all customers
  const fetchCustomers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/customers/')
      customers.value = response.data || []
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
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})

