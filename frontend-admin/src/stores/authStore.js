import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('nara_admin_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('nara_admin_user') || 'null'))

  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('nara_admin_token', newToken)
    localStorage.setItem('nara_admin_user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('nara_admin_token')
    localStorage.removeItem('nara_admin_user')
  }

  async function login(email, password) {
    const { data } = await api.post('/admin/auth/login', { email, password })
    setSession(data.token, data.user)
    return data
  }

  return { token, user, isAuthenticated, login, logout }
})
