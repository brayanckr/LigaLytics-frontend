import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AccountDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { setUnauthorizedHandler } from '../api/axiosClient'

interface AuthState {
  account: AccountDto | null
  loading: boolean
  /** true cuando el servidor rechazo una sesion que existia (401/403); se limpia al volver a entrar. */
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, displayName: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Actualiza el saldo mostrado tras apostar o liquidar. */
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** El servidor aceptó las credenciales pero el navegador no conservó la cookie de sesión. */
export class SessionNotStoredError extends Error {
  constructor() {
    super('session-not-stored')
  }
}

/**
 * La cookie es HttpOnly, así que el script no puede mirar si se guardó: la única forma de saberlo es usarla.
 * Se hace justo después de entrar para avisar ahí del problema, en vez de que falle la primera pantalla protegida.
 */
async function confirmSession(): Promise<AccountDto> {
  try {
    return await ligalyticsApi.me()
  } catch {
    throw new SessionNotStoredError()
  }
}

/**
 * Sesion de la demostracion. El token vive en una cookie HttpOnly que el navegador envia solo: el JavaScript no
 * puede leerlo, asi que para saber si hay sesion se le pregunta al servidor (`/auth/me`) al cargar la pagina.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  // Para distinguir «la sesion caduco» de «nunca hubo sesion» (el 401 de la comprobacion inicial).
  const hadAccount = useRef(false)

  useEffect(() => {
    hadAccount.current = account !== null
  }, [account])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (hadAccount.current) {
        setSessionExpired(true)
      }
      setAccount(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      setAccount(await ligalyticsApi.me())
    } catch {
      setAccount(null)
    }
  }, [])

  useEffect(() => {
    // Versiones anteriores guardaban el token en localStorage, al alcance de cualquier script: se borra.
    try {
      localStorage.removeItem('ligalytics.token')
    } catch {
      // sin almacenamiento disponible: no hay nada que limpiar
    }
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const value = useMemo<AuthState>(
    () => ({
      account,
      loading,
      sessionExpired,
      refresh,
      login: async (email, password) => {
        await ligalyticsApi.login(email, password)
        const confirmed = await confirmSession()
        setSessionExpired(false)
        setAccount(confirmed)
      },
      register: async (email, displayName, password) => {
        await ligalyticsApi.register(email, displayName, password)
        const confirmed = await confirmSession()
        setSessionExpired(false)
        setAccount(confirmed)
      },
      logout: async () => {
        try {
          await ligalyticsApi.logout()
        } catch {
          // si la sesion ya no es valida, el servidor ya la habra descartado: basta con olvidar la cuenta
        }
        setSessionExpired(false)
        setAccount(null)
      },
    }),
    [account, loading, sessionExpired, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
