import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useUnitStore = defineStore('unit', () => {
  const units = ref([])
  const unitCategories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all units
  const fetchUnits = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/products/units/')
      units.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch units'
      console.error('Error fetching units:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch all unit categories
  const fetchUnitCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/products/unit-categories/')
      unitCategories.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch unit categories'
      console.error('Error fetching unit categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Create unit
  const createUnit = async (unitData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/products/units/', unitData)
      await fetchUnits()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create unit'
      console.error('Error creating unit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update unit
  const updateUnit = async (id, unitData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/products/units/${id}/`, unitData)
      await fetchUnits()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update unit'
      console.error('Error updating unit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete unit
  const deleteUnit = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/products/units/${id}/`)
      await fetchUnits()
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete unit'
      console.error('Error deleting unit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create unit category
  const createUnitCategory = async (categoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/products/unit-categories/', categoryData)
      await fetchUnitCategories()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create unit category'
      console.error('Error creating unit category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update unit category
  const updateUnitCategory = async (id, categoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/products/unit-categories/${id}/`, categoryData)
      await fetchUnitCategories()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update unit category'
      console.error('Error updating unit category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete unit category
  const deleteUnitCategory = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/products/unit-categories/${id}/`)
      await fetchUnitCategories()
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete unit category'
      console.error('Error deleting unit category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    units,
    unitCategories,
    loading,
    error,
    fetchUnits,
    fetchUnitCategories,
    createUnit,
    updateUnit,
    deleteUnit,
    createUnitCategory,
    updateUnitCategory,
    deleteUnitCategory
  }
})

