import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/suppliers/')
      suppliers.value = response.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch suppliers'
      console.error('Error fetching suppliers:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single supplier
  const fetchSupplier = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/suppliers/${id}/`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch supplier'
      console.error('Error fetching supplier:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create supplier
  const createSupplier = async (supplierData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/suppliers/', supplierData)
      await fetchSuppliers() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create supplier'
      console.error('Error creating supplier:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update supplier
  const updateSupplier = async (id, supplierData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/suppliers/${id}/`, supplierData)
      await fetchSuppliers() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update supplier'
      console.error('Error updating supplier:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete supplier
  const deleteSupplier = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/suppliers/${id}/`)
      await fetchSuppliers() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete supplier'
      console.error('Error deleting supplier:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    fetchSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier
  }
})

