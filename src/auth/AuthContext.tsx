import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AccountDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { getStoredToken, storeToken } from '../api/axiosClient'

interface AuthState {
  account: AccountDto | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, displayName: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Actualiza el saldo mostrado tras apostar o liquidar. */
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** Sesion de la demostracion: el token se guarda en este navegador y se envia en cada peticion. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountDto | null>(null)
  const [loading, setLoading] = useState(Boolean(getStoredToken()))

  const refresh = useCallback(async () => {
    if (!getStoredToken()) {
      setAccount(null)
      return
    }
    try {
      setAccount(await ligalyticsApi.me())
    } catch {
      storeToken(null)
      setAccount(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const value = useMemo<AuthState>(
    () => ({
      account,
      loading,
      refresh,
      login: async (email, password) => {
        const result = await ligalyticsApi.login(email, password)
        storeToken(result.token)
        setAccount(result.account)
      },
      register: async (email, displayName, password) => {
        const result = await ligalyticsApi.register(email, displayName, password)
        storeToken(result.token)
        setAccount(result.account)
      },
      logout: async () => {
        try {
          await ligalyticsApi.logout()
        } catch {
          // si el token ya no es valido, basta con olvidarlo
        }
        storeToken(null)
        setAccount(null)
      },
    }),
    [account, loading, refresh],
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
