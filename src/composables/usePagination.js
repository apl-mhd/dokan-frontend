import { ref, computed } from "vue";

/**
 * Composable for pagination logic
 * Manages pagination state and provides helper functions
 */
export function usePagination(initialPageSize = 10) {
  const currentPage = ref(1);
  const pageSize = ref(initialPageSize);
  const totalItems = ref(0);

  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / pageSize.value);
  });

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value;
  });

  const hasPrevPage = computed(() => {
    return currentPage.value > 1;
  });

  const startIndex = computed(() => {
    return (currentPage.value - 1) * pageSize.value + 1;
  });

  const endIndex = computed(() => {
    return Math.min(currentPage.value * pageSize.value, totalItems.value);
  });

  const goToPage = (page) => {
    if (page >= 1) {
      // Allow setting page even if totalPages is unknown yet (e.g., when filters reset)
      // The validation against totalPages will happen during display/rendering
      currentPage.value = page;
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++;
    }
  };

  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--;
    }
  };

  const setPageSize = (size) => {
    pageSize.value = size;
    currentPage.value = 1; // Reset to first page when changing page size
  };

  const reset = () => {
    currentPage.value = 1;
    totalItems.value = 0;
  };

  /**
   * Update pagination from API response
   * @param {object} paginationData - Pagination data from API
   */
  const updateFromResponse = (paginationData) => {
    if (paginationData) {
      totalItems.value = paginationData.totalItems || paginationData.count || 0;
      currentPage.value =
        paginationData.currentPage || paginationData.page || 1;
      pageSize.value =
        paginationData.pageSize || paginationData.page_size || pageSize.value;
    }
  };

  /**
   * Get pagination parameters for API requests
   * @returns {object} Pagination parameters
   */
  const getParams = () => {
    return {
      page: currentPage.value,
      page_size: pageSize.value,
    };
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    reset,
    updateFromResponse,
    getParams,
  };
}
