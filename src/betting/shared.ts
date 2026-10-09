import type { MarketCode, OfferDto } from '../types'

export const MARKET_ORDER: MarketCode[] = ['WINNER', 'GOALS', 'BTTS', 'CORNERS', 'CARDS']
export const MIN_STAKE = 1000
export const MAX_LEGS = 8
export const MAX_TOTAL_ODDS = 1000

/** Dinero ficticio en pesos colombianos. */
export function cop(value: number): string {
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)} COP`
}

export function describeOffer(offer: Pick<OfferDto, 'market' | 'selection' | 'line'>, home: string, away: string): string {
  const line = offer.line === null ? '' : ` ${offer.line}`
  switch (offer.market) {
    case 'WINNER':
      return offer.selection === 'HOME' ? `Gana ${home}` : offer.selection === 'AWAY' ? `Gana ${away}` : 'Empate'
    case 'BTTS':
      return `Ambos marcan: ${offer.selection === 'YES' ? 'Sí' : 'No'}`
    case 'GOALS':
      return `${offer.selection === 'OVER' ? 'Más' : 'Menos'} de${line} goles`
    case 'CORNERS':
      return `${offer.selection === 'OVER' ? 'Más' : 'Menos'} de${line} córneres`
    default:
      return `${offer.selection === 'OVER' ? 'Más' : 'Menos'} de${line} tarjetas`
  }
}

export function offerKey(eventId: number, offer: Pick<OfferDto, 'market' | 'selection' | 'line'>): string {
  return `${eventId}|${offer.market}|${offer.selection}|${offer.line ?? ''}`
}

export function sourceLabel(source: string): string {
  return source === 'demo'
    ? 'cuota demo calculada por el modelo, no es de ninguna casa real'
    : source === 'pinnacle'
      ? 'cuota real de Pinnacle'
      : 'consenso de casas'
}

export function formatKickoff(value: string): string {
  const date = new Date(value)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function formatDay(value: string): string {
  const date = new Date(value)
  const text = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const STATUS_LABEL: Record<'PENDING' | 'WON' | 'LOST' | 'VOID', { text: string; tone: string }> = {
  PENDING: { text: 'Pendiente', tone: 'bg-sky-500/15 text-sky-300' },
  WON: { text: 'Ganada', tone: 'bg-emerald-500/15 text-emerald-300' },
  LOST: { text: 'Perdida', tone: 'bg-rose-500/15 text-rose-300' },
  VOID: { text: 'Anulada', tone: 'bg-slate-600/40 text-slate-300' },
}
