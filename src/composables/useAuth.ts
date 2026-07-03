import { ref, computed, readonly } from 'vue'

const token = ref<string | null>(localStorage.getItem('token'))
const username = ref<string | null>(localStorage.getItem('username'))

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  function setAuth(newToken: string, newUsername: string) {
    token.value = newToken
    username.value = newUsername
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
  }

  function clearAuth() {
    token.value = null
    username.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  function getAuthHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return {
    token: readonly(token),
    username: readonly(username),
    isAuthenticated,
    setAuth,
    clearAuth,
    getAuthHeaders,
  }
}
