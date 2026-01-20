import api from '../utility/axios'

/**
 * Sale Return API Service
 * Handles all API calls related to sale returns
 */

/**
 * Fetch all sale returns with optional filters
 * @param {Object} params - Query parameters (search, status, refund_status, sale_id, page, page_size)
 * @returns {Promise} API response
 */
export const fetchSaleReturns = (params = {}) => {
  return api.get('/sales/returns/', { params })
}

/**
 * Fetch a single sale return by ID
 * @param {number} id - Sale return ID
 * @returns {Promise} API response
 */
export const fetchSaleReturn = (id) => {
  return api.get(`/sales/returns/${id}/`)
}

/**
 * Create a new sale return
 * @param {Object} data - Sale return data
 * @returns {Promise} API response
 */
export const createSaleReturn = (data) => {
  return api.post('/sales/returns/', data)
}

/**
 * Update an existing sale return (only pending returns)
 * @param {number} id - Sale return ID
 * @param {Object} data - Updated sale return data
 * @returns {Promise} API response
 */
export const updateSaleReturn = (id, data) => {
  return api.put(`/sales/returns/${id}/`, data)
}

/**
 * Delete a sale return (only pending returns)
 * @param {number} id - Sale return ID
 * @returns {Promise} API response
 */
export const deleteSaleReturn = (id) => {
  return api.delete(`/sales/returns/${id}/`)
}

/**
 * Complete a sale return (process inventory and accounting)
 * @param {number} id - Sale return ID
 * @returns {Promise} API response
 */
export const completeSaleReturn = (id) => {
  return api.post(`/sales/returns/${id}/complete/`)
}

/**
 * Cancel a sale return (only pending returns)
 * @param {number} id - Sale return ID
 * @returns {Promise} API response
 */
export const cancelSaleReturn = (id) => {
  return api.post(`/sales/returns/${id}/cancel/`)
}

/**
 * Get list of returnable items for a specific sale
 * @param {number} saleId - Sale ID
 * @returns {Promise} API response with returnable items
 */
export const getReturnableItems = (saleId) => {
  return api.get(`/sales/${saleId}/returnable-items/`)
}

/**
 * Download sale return PDF (if implemented later)
 * @param {number} id - Sale return ID
 * @returns {Promise} API response with PDF blob
 */
export const downloadSaleReturnPDF = async (id) => {
  try {
    const response = await api.get(`/sales/returns/${id}/pdf/`, {
      responseType: 'blob'
    })
    return response
  } catch (error) {
    console.error('Error downloading sale return PDF:', error)
    throw error
  }
}
