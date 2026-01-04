import { ref, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'

/**
 * Composable for managing Bootstrap modals
 * Provides a clean API for showing/hiding modals with automatic cleanup
 */
export function useModal() {
  const modalRef = ref(null)
  let modalInstance = null

  const show = () => {
    if (!modalInstance && modalRef.value) {
      modalInstance = new Modal(modalRef.value)
    }
    modalInstance?.show()
  }

  const hide = () => {
    modalInstance?.hide()
  }

  const toggle = () => {
    modalInstance?.toggle()
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    if (modalInstance) {
      modalInstance.dispose()
      modalInstance = null
    }
  })

  return {
    modalRef,
    show,
    hide,
    toggle
  }
}

