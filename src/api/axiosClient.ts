import axios from 'axios'
import type { ApiError } from '../types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message ?? error?.message ?? 'Error de red'
    console.error('[axiosClient]', message)
    return Promise.reject(error)
  },
)

/**
 * Extrae un mensaje legible de cualquier error lanzado por axiosClient,
 * respetando el cuerpo {@link ApiError} que devuelve el backend.
 */
export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as Partial<ApiError> | undefined
    if (payload?.message) {
      return payload.message
    }
    if (error.code === 'ECONNABORTED') {
      return 'La petición tardó demasiado. Inténtalo de nuevo.'
    }
    if (!error.response) {
      return 'No se pudo conectar con el backend.'
    }
    return error.message
  }
  return error instanceof Error ? error.message : 'Error desconocido'
}

export default axiosClient
