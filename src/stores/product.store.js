import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const categories = ref([])
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

  // Fetch all products
  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/products/list/', { params })
      
      // Handle paginated response
      if (response.data.results) {
        products.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        products.value = response.data.data || []
        pagination.value.totalItems = products.value.length
        pagination.value.totalPages = 1
      } else {
        products.value = response.data || []
        pagination.value.totalItems = products.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single product
  const fetchProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/products/${id}/`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch product'
      console.error('Error fetching product:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create product
  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/products/list/', productData)
      await fetchProducts() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create product'
      console.error('Error creating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update product
  const updateProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/products/${id}/`, productData)
      await fetchProducts() // Refresh list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update product'
      console.error('Error updating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete product
  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/products/${id}/`)
      await fetchProducts() // Refresh list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete product'
      console.error('Error deleting product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get units for a specific product
  const fetchProductUnits = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/units/`)
      return response.data.data || []
    } catch (err) {
      console.error('Error fetching product units:', err)
      return []
    }
  }

  // Check stock for products
  const checkStock = async (params) => {
    try {
      const response = await api.get('/products/stock-check/', { params })
      return response.data.data || []
    } catch (err) {
      console.error('Error checking stock:', err)
      return []
    }
  }

  return {
    products,
    categories,
    units,
    unitCategories,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProductUnits,
    checkStock
  }
})

