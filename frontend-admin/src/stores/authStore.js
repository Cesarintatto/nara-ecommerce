import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, { TOKEN_KEY, USER_KEY } from '../api/client'

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(readUser())

  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(email, password) {
    const { data } = await api.post('/admin/auth/login', { email, password })
    setSession(data.token, data.user)
    return data
  }

  return { token, user, isAuthenticated, login, logout }
})
