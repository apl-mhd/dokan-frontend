import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useUnitStore = defineStore('unit', () => {
  const units = ref([])
  const unitCategories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  const loadingCategories = ref(false)
  const categoriesError = ref(null)
  const categoriesPagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  const lastUnitsParams = ref({})
  const lastCategoriesParams = ref({})

  // Fetch all units
  const fetchUnits = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      lastUnitsParams.value = { ...params }
      const response = await api.get('/products/units/', { params })

      if (response.data.count !== undefined && params.page && params.page_size) {
        units.value = response.data.data || []
        pagination.value = {
          currentPage: response.data.page || params.page || 1,
          pageSize: response.data.page_size || params.page_size || 10,
          totalItems: response.data.count || units.value.length,
          totalPages: response.data.total_pages || Math.ceil((response.data.count || units.value.length) / (params.page_size || 10))
        }
      } else if (response.data.results) {
        units.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else {
        units.value = response.data.data || response.data || []
        pagination.value.totalItems = units.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch units'
      console.error('Error fetching units:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch all unit categories
  const fetchUnitCategories = async (params = {}) => {
    loadingCategories.value = true
    categoriesError.value = null
    try {
      lastCategoriesParams.value = { ...params }
      const response = await api.get('/products/unit-categories/', { params })

      if (response.data.count !== undefined && params.page && params.page_size) {
        unitCategories.value = response.data.data || []
        categoriesPagination.value = {
          currentPage: response.data.page || params.page || 1,
          pageSize: response.data.page_size || params.page_size || 10,
          totalItems: response.data.count || unitCategories.value.length,
          totalPages: response.data.total_pages || Math.ceil((response.data.count || unitCategories.value.length) / (params.page_size || 10))
        }
      } else if (response.data.results) {
        unitCategories.value = response.data.results
        categoriesPagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else {
        unitCategories.value = response.data.data || response.data || []
        categoriesPagination.value.totalItems = unitCategories.value.length
        categoriesPagination.value.totalPages = 1
      }
    } catch (err) {
      categoriesError.value = err.response?.data?.message || 'Failed to fetch unit categories'
      console.error('Error fetching unit categories:', err)
    } finally {
      loadingCategories.value = false
    }
  }

  // Create unit
  const createUnit = async (unitData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/products/units/', unitData)
      await fetchUnits(lastUnitsParams.value || {})
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
      await fetchUnits(lastUnitsParams.value || {})
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
      await fetchUnits(lastUnitsParams.value || {})
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
      await fetchUnitCategories(lastCategoriesParams.value || {})
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
      await fetchUnitCategories(lastCategoriesParams.value || {})
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
      await fetchUnitCategories(lastCategoriesParams.value || {})
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
    pagination,
    loadingCategories,
    categoriesError,
    categoriesPagination,
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

