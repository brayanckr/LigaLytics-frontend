/**
 * Utilidades de formato y traducción de etiquetas de la API.
 */

export function formatMarketValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} MM €`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} M €`
  }
  return `${value.toLocaleString('es-ES')} €`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatDecimal(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

const OUTCOME_LABELS: Record<string, string> = {
  HOME_WIN: 'Victoria local',
  DRAW: 'Empate',
  AWAY_WIN: 'Victoria visitante',
  OVER_2_5: 'Más de 2.5 goles',
  UNDER_2_5: 'Menos de 2.5 goles',
  OVER_9_5: 'Más de 9.5 córneres',
  UNDER_9_5: 'Menos de 9.5 córneres',
  OVER_4_5: 'Más de 4.5 tarjetas',
  UNDER_4_5: 'Menos de 4.5 tarjetas',
}

export function describeOutcome(code: string): string {
  return OUTCOME_LABELS[code] ?? code
}
