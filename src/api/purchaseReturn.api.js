import api from '../utility/axios'

/**
 * Purchase Return API Service
 * Handles all API calls related to purchase returns
 */

/**
 * Fetch all purchase returns with optional filters
 * @param {Object} params - Query parameters (search, status, supplier_id, page, page_size)
 * @returns {Promise} API response
 */
export const fetchPurchaseReturns = (params = {}) => {
  return api.get('/purchases/returns/', { params })
}

/**
 * Fetch a single purchase return by ID
 * @param {number} id - Purchase return ID
 * @returns {Promise} API response
 */
export const fetchPurchaseReturn = (id) => {
  return api.get(`/purchases/returns/${id}/`)
}

/**
 * Create a new purchase return
 * @param {Object} data - Purchase return data
 * @returns {Promise} API response
 */
export const createPurchaseReturn = (data) => {
  return api.post('/purchases/returns/', data)
}

/**
 * Update an existing purchase return (only pending returns)
 * @param {number} id - Purchase return ID
 * @param {Object} data - Updated purchase return data
 * @returns {Promise} API response
 */
export const updatePurchaseReturn = (id, data) => {
  return api.put(`/purchases/returns/${id}/`, data)
}

/**
 * Delete a purchase return (only pending returns)
 * @param {number} id - Purchase return ID
 * @returns {Promise} API response
 */
export const deletePurchaseReturn = (id) => {
  return api.delete(`/purchases/returns/${id}/`)
}

/**
 * Complete a purchase return (process inventory and accounting)
 * @param {number} id - Purchase return ID
 * @returns {Promise} API response
 */
export const completePurchaseReturn = (id) => {
  return api.post(`/purchases/returns/${id}/complete/`)
}

/**
 * Cancel a purchase return (only pending returns)
 * @param {number} id - Purchase return ID
 * @returns {Promise} API response
 */
export const cancelPurchaseReturn = (id) => {
  return api.post(`/purchases/returns/${id}/cancel/`)
}

/**
 * Get list of returnable items for a specific purchase
 * @param {number} purchaseId - Purchase ID
 * @returns {Promise} API response with returnable items
 */
export const getReturnableItems = (purchaseId) => {
  return api.get(`/purchases/${purchaseId}/returnable-items/`)
}

/**
 * Download purchase return PDF (if implemented later)
 * @param {number} id - Purchase return ID
 * @returns {Promise} API response with PDF blob
 */
export const downloadPurchaseReturnPDF = async (id) => {
  try {
    const response = await api.get(`/purchases/returns/${id}/pdf/`, {
      responseType: 'blob'
    })
    return response
  } catch (error) {
    console.error('Error downloading purchase return PDF:', error)
    throw error
  }
}
