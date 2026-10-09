import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { FixtureDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

const LIVE_REFRESH_MS = 30_000
const RANGE_DAYS = 7

/** Fecha local en formato yyyy-MM-dd. */
function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function StatusBadge({ fixture }: { fixture: FixtureDto }) {
  if (fixture.status === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
        EN VIVO
      </span>
    )
  }
  if (fixture.status === 'FINISHED') {
    return <span className="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs font-medium text-slate-300">Finalizado</span>
  }
  if (fixture.status === 'OTHER') {
    return <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">Aplazado</span>
  }
  return (
    <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-300">
      {new Date(fixture.utcDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

function TeamName({ name, crest, align }: { name: string; crest: string | null; align: 'left' | 'right' }) {
  return (
    <span className={`flex min-w-0 flex-1 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {crest && <img src={crest} alt="" className="h-6 w-6 shrink-0 object-contain" loading="lazy" />}
      <span className="truncate font-medium text-white">{name}</span>
    </span>
  )
}

function FixtureRow({ fixture }: { fixture: FixtureDto }) {
  const hasScore = fixture.homeGoals !== null && fixture.awayGoals !== null
  const canPredict = fixture.status === 'SCHEDULED' && fixture.homeTeamId !== null && fixture.awayTeamId !== null
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-slate-800/40">
      <div className="w-24 shrink-0">
        <StatusBadge fixture={fixture} />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 text-sm">
        <TeamName name={fixture.homeTeam} crest={fixture.homeCrest} align="right" />
        <span className="w-16 shrink-0 text-center text-base font-bold text-sky-300">
          {hasScore ? `${fixture.homeGoals} - ${fixture.awayGoals}` : 'vs'}
        </span>
        <TeamName name={fixture.awayTeam} crest={fixture.awayCrest} align="left" />
      </div>
      {fixture.winner && (
        <div className="order-last w-full" title={`Probabilidades de ${fixture.winner.source}`}>
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-700">
            <div className="bg-sky-400" style={{ width: `${fixture.winner.home * 100}%` }} />
            <div className="bg-slate-400" style={{ width: `${fixture.winner.draw * 100}%` }} />
            <div className="bg-violet-400" style={{ width: `${fixture.winner.away * 100}%` }} />
          </div>
          <p className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Local {Math.round(fixture.winner.home * 100)}%</span>
            <span>Empate {Math.round(fixture.winner.draw * 100)}%</span>
            <span>Visitante {Math.round(fixture.winner.away * 100)}%</span>
          </p>
        </div>
      )}
      <div className="w-28 shrink-0 text-right">
        {canPredict && (
          <Link
            to={`/predict?home=${fixture.homeTeamId}&away=${fixture.awayTeamId}`}
            className="rounded-lg bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/30"
          >
            Predecir
          </Link>
        )}
      </div>
    </li>
  )
}

export default function CalendarPage() {
  const [start, setStart] = useState(() => new Date())
  const from = isoDay(start)
  const to = isoDay(addDays(start, RANGE_DAYS - 1))

  const { data, loading, error, reload } = useApi(() => ligalyticsApi.getFixtures(from, to), [from, to])
  const fixtures = useMemo(() => data ?? [], [data])
  const hasLive = fixtures.some((fixture) => fixture.status === 'LIVE')

  // Mientras haya partidos en juego, el marcador se refresca solo.
  useEffect(() => {
    if (!hasLive) {
      return undefined
    }
    const timer = window.setInterval(reload, LIVE_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [hasLive, reload])

  const byDay = useMemo(() => {
    const groups = new Map<string, FixtureDto[]>()
    for (const fixture of [...fixtures].sort((a, b) => a.utcDate.localeCompare(b.utcDate))) {
      const key = isoDay(new Date(fixture.utcDate))
      groups.set(key, [...(groups.get(key) ?? []), fixture])
    }
    return [...groups.entries()]
  }, [fixtures])

  const live = fixtures.filter((fixture) => fixture.status === 'LIVE')

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario de LaLiga</h1>
          <p className="text-sm text-slate-400">Próximos partidos, resultados y marcadores en vivo.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setStart((current) => addDays(current, -RANGE_DAYS))}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700"
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={() => setStart(new Date())}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setStart((current) => addDays(current, RANGE_DAYS))}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700"
          >
            Siguiente →
          </button>
        </div>
      </header>

      <p className="text-xs text-slate-500">
        {from} a {to}
        {hasLive && ' · actualizando cada 30 s'}
      </p>

      {loading && fixtures.length === 0 && <Spinner label="Cargando calendario…" />}
      {error && <ErrorAlert message={error} onRetry={reload} />}

      {live.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5">
          <h2 className="px-4 pt-3 text-sm font-semibold uppercase tracking-wide text-rose-300">En vivo ahora</h2>
          <ul className="divide-y divide-slate-800">
            {live.map((fixture) => (
              <FixtureRow key={fixture.id} fixture={fixture} />
            ))}
          </ul>
        </div>
      )}

      {!error && !loading && byDay.length === 0 && (
        <p className="rounded-xl border border-slate-800 bg-slate-800/40 px-5 py-10 text-center text-sm text-slate-400">
          No hay partidos en este rango de fechas.
        </p>
      )}

      {byDay.map(([day, items]) => (
        <div key={day} className="overflow-hidden rounded-xl border border-slate-800">
          <h2 className="bg-slate-800/60 px-4 py-2 text-sm font-semibold capitalize text-slate-200">
            {new Date(`${day}T12:00:00`).toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            {items[0].matchday !== null && <span className="ml-2 text-xs text-slate-400">Jornada {items[0].matchday}</span>}
          </h2>
          <ul className="divide-y divide-slate-800">
            {items.map((fixture) => (
              <FixtureRow key={fixture.id} fixture={fixture} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
