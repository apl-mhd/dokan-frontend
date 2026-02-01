import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

const BASE = '/expenses/'
const CATEGORIES = '/expenses/categories/'

export const useExpenseStore = defineStore('expense', () => {
  const expenses = ref([])
  const categories = ref([])
  const loading = ref(false)
  const categoriesLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const categoryPagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  // --- Expense categories ---
  const fetchExpenseCategories = async (params = {}) => {
    categoriesLoading.value = true
    error.value = null
    try {
      const response = await api.get(CATEGORIES, { params })
      const data = response.data
      categories.value = data.data || []
      if (data.count !== undefined && params.page && params.page_size) {
        categoryPagination.value = {
          currentPage: data.page || params.page || 1,
          pageSize: data.page_size || params.page_size || 10,
          totalItems: data.count || 0,
          totalPages: data.total_pages || 0
        }
      } else {
        categoryPagination.value.totalItems = categories.value.length
        categoryPagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch expense categories'
      console.error('Error fetching expense categories:', err)
    } finally {
      categoriesLoading.value = false
    }
  }

  const createExpenseCategory = async (data) => {
    categoriesLoading.value = true
    error.value = null
    try {
      const response = await api.post(CATEGORIES, data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create category'
      console.error('Error creating expense category:', err)
      throw err
    } finally {
      categoriesLoading.value = false
    }
  }

  const updateExpenseCategory = async (id, data) => {
    categoriesLoading.value = true
    error.value = null
    try {
      const response = await api.put(`${CATEGORIES}${id}/`, data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update category'
      console.error('Error updating expense category:', err)
      throw err
    } finally {
      categoriesLoading.value = false
    }
  }

  const deleteExpenseCategory = async (id) => {
    categoriesLoading.value = true
    error.value = null
    try {
      await api.delete(`${CATEGORIES}${id}/`)
    } catch (err) {
      error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to delete category'
      console.error('Error deleting expense category:', err)
      throw err
    } finally {
      categoriesLoading.value = false
    }
  }

  // --- Expenses ---
  const fetchExpenses = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(BASE, { params })
      const data = response.data
      expenses.value = data.data || []
      if (data.count !== undefined && params.page && params.page_size) {
        pagination.value = {
          currentPage: data.page || params.page || 1,
          pageSize: data.page_size || params.page_size || 10,
          totalItems: data.count || 0,
          totalPages: data.total_pages || 0
        }
      } else {
        pagination.value.totalItems = expenses.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch expenses'
      console.error('Error fetching expenses:', err)
    } finally {
      loading.value = false
    }
  }

  const createExpense = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(BASE, data)
      await fetchExpenses()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create expense'
      console.error('Error creating expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateExpense = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`${BASE}${id}/`, data)
      await fetchExpenses()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update expense'
      console.error('Error updating expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteExpense = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`${BASE}${id}/`)
      await fetchExpenses()
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete expense'
      console.error('Error deleting expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    expenses,
    categories,
    loading,
    categoriesLoading,
    error,
    pagination,
    categoryPagination,
    fetchExpenseCategories,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense
  }
})
