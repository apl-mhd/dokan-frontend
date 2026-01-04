/**
 * Unit Conversion Utility
 * Handles conversion between different units and base units
 */

/**
 * Convert quantity from a specific unit to base unit
 * @param {number} quantity - Quantity in the source unit
 * @param {object} unit - Unit object with conversion_factor
 * @returns {number} - Quantity in base unit
 */
export function convertToBaseUnit(quantity, unit) {
  if (!unit || !unit.conversion_factor) {
    return quantity
  }
  return parseFloat((quantity * unit.conversion_factor).toFixed(4))
}

/**
 * Convert quantity from base unit to a specific unit
 * @param {number} baseQuantity - Quantity in base unit
 * @param {object} unit - Unit object with conversion_factor
 * @returns {number} - Quantity in target unit
 */
export function convertFromBaseUnit(baseQuantity, unit) {
  if (!unit || !unit.conversion_factor || unit.conversion_factor === 0) {
    return baseQuantity
  }
  return parseFloat((baseQuantity / unit.conversion_factor).toFixed(4))
}

/**
 * Get conversion info text for display
 * @param {number} quantity - Quantity in source unit
 * @param {object} unit - Unit object
 * @param {string} baseUnitName - Name of base unit
 * @returns {string} - Conversion info text
 */
export function getConversionInfo(quantity, unit, baseUnitName = 'base unit') {
  if (!unit || !unit.conversion_factor) {
    return ''
  }
  
  if (unit.is_base_unit) {
    return `(Base unit)`
  }
  
  const baseQty = convertToBaseUnit(quantity, unit)
  return `(${baseQty} ${baseUnitName})`
}

/**
 * Calculate total in base units for multiple items
 * @param {Array} items - Array of items with quantity and unit
 * @returns {number} - Total in base units
 */
export function calculateTotalBaseUnits(items) {
  return items.reduce((total, item) => {
    return total + convertToBaseUnit(item.quantity || 0, item.unit)
  }, 0)
}

/**
 * Format unit conversion for display
 * @param {number} quantity - Quantity in source unit
 * @param {object} unit - Unit object
 * @param {string} baseUnitName - Name of base unit
 * @returns {string} - Formatted string
 */
export function formatUnitConversion(quantity, unit, baseUnitName = 'base unit') {
  if (!quantity || !unit) {
    return '-'
  }
  
  const baseQty = convertToBaseUnit(quantity, unit)
  
  if (unit.is_base_unit) {
    return `${quantity} ${unit.name}`
  }
  
  return `${quantity} ${unit.name} = ${baseQty} ${baseUnitName}`
}

export default {
  convertToBaseUnit,
  convertFromBaseUnit,
  getConversionInfo,
  calculateTotalBaseUnits,
  formatUnitConversion
}

