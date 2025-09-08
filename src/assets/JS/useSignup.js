// useSignup.js
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'

export function useSignup() {
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const router = useRouter()
  const { login } = useAuth()

  const signup = async ({ username, email, password }) => {
    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const response = await axios.post('http://localhost:1337/api/auth/local/register', {
        username,
        email,
        password,
      })

      const token = response.data.jwt
      const user = response.data.user

      if (token && user) {
        login(token, user)
        router.push({ name: 'home' })
        return true
      } else {
        errorMessage.value = 'Réponse invalide du serveur'
        return false
      }
    } catch (error) {
      errorMessage.value = error?.response?.data?.error?.message || 'Une erreur est survenue'
      return false
    }
  }

  return {
    signup,
    isSubmitting,
    errorMessage,
  }
}
