import { useMemo } from 'react'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from './useApi'

const WINDOW_DAYS = 45

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Escudos oficiales por id de equipo, tomados del calendario (±45 días cubren a los 20 equipos). Son un extra: si el
 * calendario falla el mapa queda vacío y cada `Crest` muestra las iniciales.
 */
export function useTeamCrests(): Map<number, string> {
  const fixtures = useApi(() => {
    const from = new Date()
    const to = new Date()
    from.setDate(from.getDate() - WINDOW_DAYS)
    to.setDate(to.getDate() + WINDOW_DAYS)
    return ligalyticsApi.getFixtures(isoDay(from), isoDay(to))
  }, [])

  return useMemo(() => {
    const map = new Map<number, string>()
    for (const fixture of fixtures.data ?? []) {
      if (fixture.homeTeamId && fixture.homeCrest) map.set(fixture.homeTeamId, fixture.homeCrest)
      if (fixture.awayTeamId && fixture.awayCrest) map.set(fixture.awayTeamId, fixture.awayCrest)
    }
    return map
  }, [fixtures.data])
}
