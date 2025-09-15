// src/assets/JS/useLoading.js
import { ref } from 'vue'

export function useLoading() {
  const isLoading = ref(false)
  const loadingMessage = ref(
    'Veuillez patienter, le chargement de cette page peut prendre quelques secondes.',
  )

  function startLoading(message = null) {
    if (message) loadingMessage.value = message
    isLoading.value = true
  }

  function stopLoading() {
    isLoading.value = false
  }

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
  }
}
