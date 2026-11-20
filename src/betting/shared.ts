import type { MarketCode, OfferDto } from '../types'

export const MARKET_ORDER: MarketCode[] = ['WINNER', 'GOALS', 'BTTS', 'CORNERS', 'CARDS']
export const MIN_STAKE = 1000
export const MAX_LEGS = 8
export const MAX_TOTAL_ODDS = 1000

/** Importe en pesos colombianos. */
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

type ScoreCondition = (home: number, away: number) => boolean

/** Condición de la selección sobre el marcador final, o nulo si no depende solo del marcador (córneres, tarjetas). */
function scoreCondition(offer: Pick<OfferDto, 'market' | 'selection' | 'line'>): ScoreCondition | null {
  const line = offer.line
  switch (offer.market) {
    case 'WINNER':
      return offer.selection === 'HOME'
        ? (h, a) => h > a
        : offer.selection === 'DRAW'
          ? (h, a) => h === a
          : offer.selection === 'AWAY'
            ? (h, a) => h < a
            : null
    case 'GOALS':
      if (line === null) return null
      return offer.selection === 'OVER'
        ? (h, a) => h + a > line
        : offer.selection === 'UNDER'
          ? (h, a) => h + a < line
          : null
    case 'BTTS':
      return offer.selection === 'YES' ? (h, a) => h > 0 && a > 0 : offer.selection === 'NO' ? (h, a) => h === 0 || a === 0 : null
    default:
      return null
  }
}

/**
 * Si dos selecciones del mismo partido no se pueden combinar (misma regla que el servidor): las del mismo mercado,
 * las que no pueden cumplirse a la vez (ambos marcan «sí» con menos de 1,5 goles) y las que una implica la otra
 * (ambos marcan «sí» con más de 1,5 goles). El resto sí, con la cuota ajustada por correlación.
 */
export function offersConflict(
  a: Pick<OfferDto, 'market' | 'selection' | 'line'>,
  b: Pick<OfferDto, 'market' | 'selection' | 'line'>,
): boolean {
  if (a.market === b.market) {
    return true
  }
  const inA = scoreCondition(a)
  const inB = scoreCondition(b)
  if (inA === null || inB === null) {
    return false
  }
  let both = false
  let onlyA = false
  let onlyB = false
  for (let home = 0; home <= 10; home++) {
    for (let away = 0; away <= 10; away++) {
      const x = inA(home, away)
      const y = inB(home, away)
      both ||= x && y
      onlyA ||= x && !y
      onlyB ||= !x && y
    }
  }
  return !both || !onlyA || !onlyB
}

export function offerKey(eventId: number, offer: Pick<OfferDto, 'market' | 'selection' | 'line'>): string {
  return `${eventId}|${offer.market}|${offer.selection}|${offer.line ?? ''}`
}

export function sourceLabel(source: string): string {
  return source === 'demo'
    ? 'cuota calculada por el modelo'
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
