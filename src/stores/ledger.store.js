import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utility/axios'

export const useLedgerStore = defineStore('ledger', () => {
  const ledgerEntries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })

  // Fetch all ledger entries
  const fetchLedgerEntries = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/accounting/ledgers/', { params })
      
      // Handle paginated response
      if (response.data.results) {
        ledgerEntries.value = response.data.results
        pagination.value = {
          currentPage: params.page || 1,
          pageSize: params.page_size || 10,
          totalItems: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params.page_size || 10))
        }
      } else if (response.data.data) {
        // Handle wrapped response
        ledgerEntries.value = response.data.data || []
        pagination.value.totalItems = ledgerEntries.value.length
        pagination.value.totalPages = 1
      } else {
        // Handle direct array response
        ledgerEntries.value = response.data || []
        pagination.value.totalItems = ledgerEntries.value.length
        pagination.value.totalPages = 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch ledger entries'
      console.error('Error fetching ledger entries:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single ledger entry
  const fetchLedgerEntry = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/accounting/ledgers/${id}/`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch ledger entry'
      console.error('Error fetching ledger entry:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    ledgerEntries,
    loading,
    error,
    pagination,
    fetchLedgerEntries,
    fetchLedgerEntry
  }
})
