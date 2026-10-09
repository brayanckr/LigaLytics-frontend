import { useCallback, useEffect, useState } from 'react'
import { extractApiError } from '../api/axiosClient'

export interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * Hook genérico para consumir la API con estados de carga y error.
 * El `loader` se reejecuta cuando cambian las dependencias indicadas o al
 * llamar a `reload()`.
 */
export function useApi<T>(loader: () => Promise<T>, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    loader()
      .then((result) => {
        if (active) {
          setData(result)
        }
      })
      .catch((cause) => {
        if (active) {
          setError(extractApiError(cause))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { data, loading, error, reload }
}
