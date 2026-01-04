/**
 * Composable for confirmation dialogs
 * Provides a consistent way to ask for user confirmation
 */
export function useConfirm() {
  /**
   * Show a confirmation dialog
   * @param {string} message - Message to display
   * @param {string} title - Optional title (not used in native confirm, but kept for API consistency)
   * @returns {Promise<boolean>} True if confirmed, false otherwise
   */
  const confirm = async (message, title = '') => {
    return window.confirm(message)
  }

  /**
   * Show a confirmation dialog for deletion
   * @param {string} itemName - Name of the item to delete
   * @param {string} itemType - Type of item (e.g., 'product', 'customer')
   * @returns {Promise<boolean>} True if confirmed, false otherwise
   */
  const confirmDelete = async (itemName, itemType = 'item') => {
    return window.confirm(`Are you sure you want to delete ${itemType} "${itemName}"?`)
  }

  /**
   * Show a generic action confirmation
   * @param {string} action - Action to confirm (e.g., 'archive', 'export')
   * @param {string} itemName - Name of the item
   * @returns {Promise<boolean>} True if confirmed, false otherwise
   */
  const confirmAction = async (action, itemName = '') => {
    const message = itemName
      ? `Are you sure you want to ${action} "${itemName}"?`
      : `Are you sure you want to ${action}?`
    return window.confirm(message)
  }

  return {
    confirm,
    confirmDelete,
    confirmAction
  }
}

