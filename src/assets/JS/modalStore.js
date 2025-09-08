import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const showSignupForm = ref(false)
  const showLoginForm = ref(false)

  const openSignup = () => {
    showSignupForm.value = true
  }

  const closeSignup = () => {
    showSignupForm.value = false
  }

  const openLogin = () => {
    showLoginForm.value = true
  }

  const closeLogin = () => {
    showLoginForm.value = false
  }

  return {
    showSignupForm,
    openSignup,
    closeSignup,
    showLoginForm,
    openLogin,
    closeLogin,
  }
})
