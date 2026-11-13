import axios from 'axios'

export const TOKEN_KEY = 'naracol_admin_token'
export const USER_KEY = 'naracol_admin_user'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Sesión vencida: limpiar y volver al login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login?expirada=1')
    }
    return Promise.reject(err)
  },
)

// Mensaje legible de un error de la API
export const errorMessage = (err, fallback = 'Algo salió mal. Intenta de nuevo.') =>
  err?.response?.data?.error || (err?.response ? fallback : 'No hay conexión con el servidor.')

// Sube una imagen y devuelve su URL pública (GCS, WebP)
export async function uploadImage(file, folder) {
  const form = new FormData()
  form.append('image', file)
  form.append('folder', folder)
  const { data } = await api.post('/admin/uploads/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

export default api
