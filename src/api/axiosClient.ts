import axios from 'axios'
import type { ApiError } from '../types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

/** Raíz de la API; el canal en vivo (SockJS) cuelga de ella en `/ws`. */
export const API_BASE_URL: string = baseURL

// La sesion vive en una cookie HttpOnly que pone el servidor: este codigo nunca ve el token. `withCredentials`
// hace que el navegador la adjunte tambien entre origenes (el CORS del backend solo admite los orígenes permitidos),
// y `X-Requested-With` es la marca que el backend exige en las peticiones que modifican datos (anti-CSRF).
const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 15000,
})

let unauthorizedHandler: (() => void) | null = null

/** AuthProvider se registra aqui para enterarse de que el servidor rechazo la sesion (401/403). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

// Rutas donde 401/403 no significa «sesion caducada»: credenciales erroneas al entrar y la clave de administracion.
const SESSION_NEUTRAL = ['/auth/login', '/auth/register', '/admin']

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url: string = error?.config?.url ?? ''
    if ((status === 401 || status === 403) && !SESSION_NEUTRAL.some((path) => url.startsWith(path))) {
      unauthorizedHandler?.()
    }
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
