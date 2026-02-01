import api from '../utility/axios'

// Customer Payments (Received from customers)
export const fetchCustomerPayments = (params = {}) => {
  return api.get('/payments/customer/', { params })
}

export const fetchCustomerPayment = (id) => {
  return api.get(`/payments/customer/${id}/`)
}

export const createCustomerPayment = (data) => {
  return api.post('/payments/customer/', data)
}

export const updateCustomerPayment = (id, data) => {
  return api.put(`/payments/customer/${id}/`, data)
}

export const deleteCustomerPayment = (id) => {
  return api.delete(`/payments/customer/${id}/`)
}

// Supplier Payments (Made to suppliers)
export const fetchSupplierPayments = (params = {}) => {
  return api.get('/payments/supplier/', { params })
}

export const fetchSupplierPayment = (id) => {
  return api.get(`/payments/supplier/${id}/`)
}

export const createSupplierPayment = (data) => {
  return api.post('/payments/supplier/', data)
}

export const updateSupplierPayment = (id, data) => {
  return api.put(`/payments/supplier/${id}/`, data)
}

export const deleteSupplierPayment = (id) => {
  return api.delete(`/payments/supplier/${id}/`)
}

// Refunds (unified payment API with payment_type)
export const fetchCustomerRefunds = (params = {}) => {
  return api.get('/payments/', { params: { ...params, payment_type: 'customer_refund' } })
}

export const fetchSupplierRefunds = (params = {}) => {
  return api.get('/payments/', { params: { ...params, payment_type: 'supplier_refund' } })
}

export const createRefund = (data) => {
  return api.post('/payments/', data)
}

export const fetchRefund = (id) => {
  return api.get(`/payments/${id}/`)
}

export const deleteRefund = (id) => {
  return api.delete(`/payments/${id}/`)
}
