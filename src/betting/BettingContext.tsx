import { createContext, useContext } from 'react'
import type { OfferDto } from '../types'

/** Selección añadida al cupón: la cuota se muestra, pero la fija el servidor al apostar. */
export interface SlipItem {
  key: string
  eventId: number
  homeTeam: string
  awayTeam: string
  kickoff: string
  offer: OfferDto
}

export interface BettingState {
  items: SlipItem[]
  stake: number
  setStake: (stake: number) => void
  /** Añade la selección o la quita si ya estaba; solo cabe una por partido (la nueva sustituye a la anterior). */
  toggle: (item: SlipItem) => void
  /** Deja el cupón con una sola selección (p. ej. desde una recomendación). */
  selectOnly: (item: SlipItem, stake?: number) => void
  remove: (key: string) => void
  clear: () => void
  /** Aviso cuando una selección sustituye a otra del mismo partido (en una combinada solo cabe una por partido). */
  notice: string | null
  balance: number
  /** Recarga saldo e historial tras apostar. */
  onPlaced: (message: string) => void
}

export const BettingContext = createContext<BettingState | null>(null)

export function useBetting(): BettingState {
  const context = useContext(BettingContext)
  if (!context) {
    throw new Error('useBetting debe usarse dentro de BettingPage')
  }
  return context
}
