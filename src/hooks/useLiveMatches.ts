import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { API_BASE_URL } from '../api/axiosClient'

export const LIVE_TOPIC = '/topic/live-matches'

/**
 * Raíz del canal en vivo. Por defecto es la de la API; hay que separarla cuando la API se llama por una ruta
 * relativa reenviada por Vercel (`VITE_API_BASE_URL=/api`), porque Vercel no reenvía WebSockets: entonces el canal
 * en vivo (que no usa cookies) se conecta directo al backend con `VITE_LIVE_BASE_URL=https://<backend>/api`.
 */
const LIVE_BASE_URL: string = import.meta.env.VITE_LIVE_BASE_URL ?? API_BASE_URL

/** Estado en vivo de un partido, acumulado a partir de los eventos recibidos. */
export interface LiveMatchState {
  eventId: number
  /** Tipo del último evento (GOAL, CORNER, FULL_TIME…). */
  type: string
  minute: number | null
  homeScore: number | null
  awayScore: number | null
  corners: number | null
  cards: number | null
  finished: boolean
  /** Instante (ms) del último evento aplicado; sirve para descartar eventos que llegan desordenados. */
  occurredAt: number | null
  /** Cuántos eventos se han aplicado; cambia con cada actualización para poder resaltarla. */
  updates: number
}

export type LiveStatus = 'connecting' | 'connected' | 'disconnected'

export type LiveEvent = Omit<LiveMatchState, 'finished' | 'updates'>

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** Interpreta el cuerpo de un mensaje; devuelve null si no es un evento utilizable (nunca se fía del formato). */
export function parseLiveEvent(body: string): LiveEvent | null {
  let raw: unknown
  try {
    raw = JSON.parse(body)
  } catch {
    return null
  }
  if (typeof raw !== 'object' || raw === null) return null
  const event = raw as Record<string, unknown>
  const eventId = Number(event.eventId)
  if (!Number.isFinite(eventId) || typeof event.type !== 'string' || event.type === '') return null
  const occurred = typeof event.occurredAt === 'string' ? Date.parse(event.occurredAt) : NaN
  return {
    eventId,
    type: event.type.toUpperCase(),
    minute: asNumber(event.minute),
    homeScore: asNumber(event.homeScore),
    awayScore: asNumber(event.awayScore),
    corners: asNumber(event.corners),
    cards: asNumber(event.cards),
    occurredAt: Number.isNaN(occurred) ? null : occurred,
  }
}

/** Aplica un evento al estado previo: lo que el evento no trae se conserva, y los eventos más viejos se ignoran. */
export function mergeLiveEvent(previous: LiveMatchState | undefined, event: LiveEvent): LiveMatchState {
  if (previous && previous.occurredAt !== null && event.occurredAt !== null && event.occurredAt < previous.occurredAt) {
    return previous
  }
  return {
    eventId: event.eventId,
    type: event.type,
    minute: event.minute ?? previous?.minute ?? null,
    homeScore: event.homeScore ?? previous?.homeScore ?? null,
    awayScore: event.awayScore ?? previous?.awayScore ?? null,
    corners: event.corners ?? previous?.corners ?? null,
    cards: event.cards ?? previous?.cards ?? null,
    finished: event.type === 'FULL_TIME' || (previous?.finished ?? false),
    occurredAt: event.occurredAt ?? previous?.occurredAt ?? null,
    updates: (previous?.updates ?? 0) + 1,
  }
}

/**
 * Se conecta por SockJS + STOMP al montarse, se suscribe a {@link LIVE_TOPIC} y mantiene el estado en vivo por
 * partido (clave: eventId). Reintenta solo si se cae y se desconecta al desmontarse. Una sola conexión sirve a
 * todas las tarjetas de la pantalla.
 */
export function useLiveMatches(): { live: Map<number, LiveMatchState>; status: LiveStatus } {
  const [live, setLive] = useState<Map<number, LiveMatchState>>(() => new Map())
  const [status, setStatus] = useState<LiveStatus>('connecting')

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${LIVE_BASE_URL}/ws`) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setStatus('connected')
        // Se suscribe en cada (re)conexión: STOMP no conserva las suscripciones al caerse el socket.
        client.subscribe(LIVE_TOPIC, (message) => {
          const event = parseLiveEvent(message.body)
          if (!event) return
          setLive((current) => {
            const previous = current.get(event.eventId)
            const next = mergeLiveEvent(previous, event)
            return next === previous ? current : new Map(current).set(event.eventId, next)
          })
        })
      },
      onWebSocketClose: () => setStatus('disconnected'),
    })
    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [])

  return { live, status }
}
