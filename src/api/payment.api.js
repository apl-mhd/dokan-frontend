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
