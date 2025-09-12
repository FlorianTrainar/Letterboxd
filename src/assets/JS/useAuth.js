import { ref, computed } from 'vue'
import Cookies from 'js-cookie'

const token = ref(Cookies.get('token') || '')
const user = ref(Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null)
const loggedIn = computed(() => !!token.value && !!user.value)

function login(jwt, userData) {
  token.value = jwt
  user.value = userData

  Cookies.set('token', jwt, { expires: 7 })
  Cookies.set('user', JSON.stringify(userData), { expires: 7 })
}

function logout() {
  // Supprime le cookie et met loggedIn à false
  Cookies.remove('token')
  Cookies.remove('user')
  token.value = ''
  user.value = null
}

// Optionnel : permet de re-synchroniser (si jamais nécessaire)
function checkAuth() {
  token.value = Cookies.get('token') || ''
  const userCookie = Cookies.get('user')
  user.value = userCookie ? JSON.parse(userCookie) : null
}

export function useAuth() {
  // Cette fonction expose l’état et les méthodes
  return {
    token,
    user,
    loggedIn,
    login,
    logout,
    checkAuth,
  }
}
