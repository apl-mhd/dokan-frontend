/**
 * Composable for common formatting functions
 * Provides consistent formatting across the application
 */
export function useFormatter() {
  /**
   * Format a date string to localized date format
   * @param {string} dateString - ISO date string
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date or '-' if invalid
   */
  const formatDate = (dateString, options = {}) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString(undefined, options)
    } catch (error) {
      console.error('Error formatting date:', error)
      return '-'
    }
  }

  /**
   * Format a date string to localized datetime format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted datetime or '-' if invalid
   */
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString()
    } catch (error) {
      console.error('Error formatting datetime:', error)
      return '-'
    }
  }

  /**
   * Format a number as currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol (default: '৳')
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount, currency = '৳', decimals = 2) => {
    if (amount === null || amount === undefined) return '-'
    const formatted = Number(amount).toFixed(decimals)
    return `${currency}${formatted}`
  }

  /**
   * Format a number with thousand separators
   * @param {number} number - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number
   */
  const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined) return '-'
    return Number(number).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  /**
   * Truncate a string to a maximum length
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add if truncated (default: '...')
   * @returns {string} Truncated string
   */
  const truncate = (str, maxLength = 50, suffix = '...') => {
    if (!str) return '-'
    if (str.length <= maxLength) return str
    return str.substring(0, maxLength - suffix.length) + suffix
  }

  /**
   * Format a boolean as Yes/No
   * @param {boolean} value - Boolean value
   * @returns {string} 'Yes' or 'No'
   */
  const formatBoolean = (value) => {
    return value ? 'Yes' : 'No'
  }

  /**
   * Get a badge class based on status
   * @param {string} status - Status value
   * @param {object} statusMap - Custom status to class mapping
   * @returns {string} Bootstrap badge class
   */
  const getStatusClass = (status, statusMap = {}) => {
    const defaultMap = {
      pending: 'bg-warning text-dark',
      completed: 'bg-success',
      delivered: 'bg-success',
      partial_return: 'bg-warning text-dark', // Partially Returned
      returned: 'bg-danger', // Fully Returned
      cancelled: 'bg-danger',
      active: 'bg-success',
      inactive: 'bg-secondary',
      draft: 'bg-secondary',
      ...statusMap
    }
    return defaultMap[status?.toLowerCase()] || 'bg-secondary'
  }

  return {
    formatDate,
    formatDateTime,
    formatCurrency,
    formatNumber,
    truncate,
    formatBoolean,
    getStatusClass
  }
}

