import { useEffect, useState } from 'react'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import type { ParlayQuoteDto } from '../types'
import type { SlipItem } from './BettingContext'

export interface ParlayPrice {
  /** Cuota total del boleto: la que cotiza el servidor, o el producto de las cuotas si no hay selecciones del mismo partido. */
  totalOdds: number
  /** Cotización del servidor (solo cuando hay varias selecciones del mismo partido). */
  quote: ParlayQuoteDto | null
  /** Esperando la cotización del servidor: todavía no se puede apostar. */
  pending: boolean
  /** Motivo si el servidor no pudo cotizar la combinación. */
  error: string | null
}

interface QuoteState {
  key: string
  quote: ParlayQuoteDto | null
  error: string | null
}

/**
 * Precio del boleto. Con selecciones de partidos distintos la cuota es el producto de las cuotas; si hay varias del
 * mismo partido (ambos marcan y más de 2,5 goles, por ejemplo) las casas las ajustan por correlación y aquí lo hace
 * el servidor, así que se le pregunta y se muestra exactamente la cuota que se pagará.
 */
export function useParlayPrice(items: SlipItem[]): ParlayPrice {
  const product = Math.round(items.reduce((acc, item) => acc * item.offer.odds, 1) * 100) / 100
  const sameMatch = items.length >= 2 && new Set(items.map((i) => i.eventId)).size < items.length
  const legsKey = items.map((i) => i.key).join('|')
  const [state, setState] = useState<QuoteState>({ key: '', quote: null, error: null })

  useEffect(() => {
    if (!sameMatch) {
      return
    }
    let cancelled = false
    ligalyticsApi
      .quoteParlay({
        legs: items.map((i) => ({
          eventId: i.eventId,
          market: i.offer.market,
          selection: i.offer.selection,
          line: i.offer.line,
        })),
      })
      .then((quote) => {
        if (!cancelled) setState({ key: legsKey, quote, error: null })
      })
      .catch((cause) => {
        if (!cancelled) setState({ key: legsKey, quote: null, error: extractApiError(cause) })
      })
    return () => {
      cancelled = true
    }
    // items solo cambia de contenido cuando cambia legsKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legsKey, sameMatch])

  const current = sameMatch && state.key === legsKey ? state : null
  return {
    totalOdds: current?.quote ? current.quote.totalOdds : product,
    quote: current?.quote ?? null,
    pending: sameMatch && current === null,
    error: current?.error ?? null,
  }
}
