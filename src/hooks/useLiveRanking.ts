import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { RankingEntryDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { LIVE_BASE_URL } from './useLiveMatches'

export const RANKING_TOPIC = '/topic/ranking'

/** Red de seguridad: si el canal en vivo se cae, la tabla se vuelve a pedir cada minuto. */
const FALLBACK_POLL_MS = 60_000

/**
 * Clasificación que se mantiene al día sola: se suscribe a {@link RANKING_TOPIC} (el backend avisa cuando termina
 * un partido y se guarda) y vuelve a pedir la tabla sin mostrar el esqueleto de carga. Además repite la petición
 * cada minuto y al volver a la pestaña.
 */
export function useLiveRanking(season?: number) {
  const [data, setData] = useState<RankingEntryDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const requestId = useRef(0)

  const load = useCallback(
    (silent: boolean) => {
      const id = ++requestId.current
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      ligalyticsApi
        .getRanking(season)
        .then((result) => {
          if (id !== requestId.current) return
          setData(result)
          setError(null)
          setUpdatedAt(Date.now())
        })
        .catch((cause) => {
          // Una actualización silenciosa fallida conserva la tabla que ya se ve.
          if (id === requestId.current && !silent) setError(extractApiError(cause))
        })
        .finally(() => {
          if (id === requestId.current && !silent) setLoading(false)
        })
    },
    [season],
  )

  useEffect(() => {
    load(false)
    const poll = window.setInterval(() => load(true), FALLBACK_POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load(true)
    }
    document.addEventListener('visibilitychange', onVisible)

    const client = new Client({
      webSocketFactory: () => new SockJS(`${LIVE_BASE_URL}/ws`) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(RANKING_TOPIC, () => load(true))
      },
    })
    client.activate()

    return () => {
      window.clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
      void client.deactivate()
    }
  }, [load])

  return { data, loading, error, updatedAt, reload: () => load(false) }
}
