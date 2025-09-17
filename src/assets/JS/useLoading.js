// src/assets/JS/useLoading.js
import { ref } from 'vue'

export function useLoading(delay = 1500) {
  const showLoadingMessage = ref(false) // ⬅️ toujours immédiat
  const showStrapiLoadingMessage = ref(false) // ⬅️ après délai

  let timeoutId = null

  function startLoading() {
    showLoadingMessage.value = true
    showStrapiLoadingMessage.value = false

    timeoutId = setTimeout(() => {
      // Si le chargement dure longtemps, on affiche le message différé
      showStrapiLoadingMessage.value = true
    }, delay)
  }

  function stopLoading() {
    showLoadingMessage.value = false
    showStrapiLoadingMessage.value = false
    clearTimeout(timeoutId)
  }

  return {
    showLoadingMessage,
    showStrapiLoadingMessage,
    // loadingMessage,
    startLoading,
    stopLoading,
  }
}
