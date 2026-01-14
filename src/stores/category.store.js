import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all categories
  const fetchCategories = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/products/categories/', { params })
      categories.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single category
  const fetchCategory = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/products/categories/${id}/`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch category'
      console.error('Error fetching category:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create category
  const createCategory = async (categoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/products/categories/', categoryData)
      await fetchCategories() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create category'
      console.error('Error creating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update category
  const updateCategory = async (id, categoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/products/categories/${id}/`, categoryData)
      await fetchCategories() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update category'
      console.error('Error updating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete category
  const deleteCategory = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/products/categories/${id}/`)
      await fetchCategories() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete category'
      console.error('Error deleting category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory
  }
})

