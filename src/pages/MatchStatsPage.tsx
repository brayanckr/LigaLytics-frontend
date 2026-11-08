import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import Crest from '../betting/Crest'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import { useLiveMatches } from '../hooks/useLiveMatches'
import type { MatchDetailDto, MatchStatDto } from '../types'

/** Mientras el partido está en juego se vuelve a pedir el detalle (el backend lo cachea 20 s). */
const LIVE_POLL_MS = 20_000

type Kind = 'played' | 'event'

/**
 * Carga el detalle de un partido. Los partidos en vivo se refrescan solos sin mostrar la carga; si una actualización
 * falla se conserva lo que ya se ve.
 */
function useMatchDetail(kind: Kind, id: number) {
  const [data, setData] = useState<MatchDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(
    (silent: boolean) => {
      const current = ++requestId.current
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      const request = kind === 'played' ? ligalyticsApi.getPlayedMatch(id) : ligalyticsApi.getLiveMatch(id)
      request
        .then((result) => {
          if (current !== requestId.current) return
          setData(result)
          setError(null)
        })
        .catch((cause) => {
          if (current === requestId.current && !silent) setError(extractApiError(cause))
        })
        .finally(() => {
          if (current === requestId.current && !silent) setLoading(false)
        })
    },
    [kind, id],
  )

  useEffect(() => {
    load(false)
  }, [load])

  const status = data?.status
  useEffect(() => {
    if (kind !== 'event' || status === 'FINISHED') return undefined
    const timer = window.setInterval(() => load(true), LIVE_POLL_MS)
    return () => window.clearInterval(timer)
  }, [kind, status, load])

  return { data, loading, error, reload: () => load(false) }
}

function formatValue(stat: MatchStatDto, value: number): string {
  if (stat.key === 'xg') return value.toFixed(2)
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/** Fila comparativa: valores a los lados y una barra partida proporcional; el lado con más valor se resalta. */
function StatRow({ stat }: { stat: MatchStatDto }) {
  const { home, away } = stat
  if (home !== null && away === null) {
    return (
      <li className="flex items-center justify-between gap-3 py-3 text-sm">
        <span className="text-slate-400">{stat.label}</span>
        <span className="num text-white">{formatValue(stat, home)}</span>
      </li>
    )
  }
  if (home === null || away === null) return null
  const total = home + away
  const homeShare = total > 0 ? (home / total) * 100 : 50
  const homeLeads = home > away
  const awayLeads = away > home
  return (
    <li className="space-y-2 py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-3 text-sm">
        <span className={`num text-left text-base ${homeLeads ? 'text-sky-300' : 'text-slate-300'}`}>
          {formatValue(stat, home)}
        </span>
        <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</span>
        <span className={`num text-right text-base ${awayLeads ? 'text-lime-300' : 'text-slate-300'}`}>
          {formatValue(stat, away)}
        </span>
      </div>
      <div
        role="img"
        aria-label={`${stat.label}: local ${formatValue(stat, home)}, visitante ${formatValue(stat, away)}`}
        className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-white/5"
      >
        <span className="bg-sky-500 transition-[width] duration-500" style={{ width: `${homeShare}%` }} />
        <span className="bg-lime-400 transition-[width] duration-500" style={{ width: `${100 - homeShare}%` }} />
      </div>
    </li>
  )
}

function StatusBadge({ match }: { match: MatchDetailDto }) {
  if (match.status === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-300">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rose-400 motion-safe:animate-pulse-dot" />
        En vivo{match.minute !== null && <span className="num">{match.minute}&apos;</span>}
      </span>
    )
  }
  const text = match.status === 'FINISHED' ? 'Final' : match.status === 'SCHEDULED' ? 'Por jugar' : 'Sin datos'
  return (
    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-300">{text}</span>
  )
}

/** Detalle de un partido: marcador y estadísticas comparadas, en vivo (por proveedor) o ya jugado (guardadas). */
export default function MatchStatsPage({ kind }: { kind: Kind }) {
  const params = useParams()
  const navigate = useNavigate()
  const id = Number(kind === 'played' ? params.matchId : params.eventId)
  const { data, loading, error, reload } = useMatchDetail(kind, id)
  // El canal en vivo adelanta marcador y minuto sin esperar al siguiente sondeo.
  const { live } = useLiveMatches()
  const push = kind === 'event' ? live.get(id) : undefined

  if (!Number.isFinite(id)) {
    return <ErrorAlert message="Partido no válido" />
  }
  if (loading) return <Spinner label="Cargando partido…" />
  if (error || !data) {
    return (
      <div className="space-y-3">
        <ErrorAlert message={error ?? 'Partido no disponible'} onRetry={reload} />
        <button type="button" onClick={() => navigate(-1)} className="text-sm text-sky-300 hover:underline">
          ‹ Volver
        </button>
      </div>
    )
  }

  const homeGoals = push?.homeScore ?? data.homeGoals
  const awayGoals = push?.awayScore ?? data.awayGoals
  const minute = push?.minute ?? data.minute
  const shown: MatchDetailDto = push && !push.finished ? { ...data, minute, status: 'LIVE' } : data
  const when = data.date
    ? new Date(data.date).toLocaleString('es-CO', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <section className="space-y-5">
      <button type="button" onClick={() => navigate(-1)} className="text-sm text-sky-300 hover:underline">
        ‹ Volver
      </button>

      <header className="card relative overflow-hidden p-5 shadow-float sm:p-6">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            {when ?? 'LaLiga'}
            {data.season ? ` · Temporada ${data.season}` : ''}
          </span>
          <StatusBadge match={shown} />
        </div>
        <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <span className="flex min-w-0 flex-col items-center gap-2">
            <Crest name={data.homeTeam} size="lg" />
            <span className="w-full truncate text-sm font-extrabold text-white sm:text-base">{data.homeTeam}</span>
          </span>
          <span aria-live="polite" className="num flex items-center gap-2 text-4xl text-white sm:text-5xl">
            <span>{homeGoals ?? '–'}</span>
            <span className="text-slate-600">:</span>
            <span>{awayGoals ?? '–'}</span>
          </span>
          <span className="flex min-w-0 flex-col items-center gap-2">
            <Crest name={data.awayTeam} size="lg" />
            <span className="w-full truncate text-sm font-extrabold text-white sm:text-base">{data.awayTeam}</span>
          </span>
        </div>
      </header>

      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-white">Estadísticas</h2>
          {shown.status === 'LIVE' && <span className="text-xs text-slate-400">Se actualizan cada pocos segundos</span>}
        </div>
        {data.stats.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            {shown.status === 'SCHEDULED'
              ? 'El partido aún no empieza: las estadísticas aparecerán cuando se juegue.'
              : 'La fuente de datos no tiene estadísticas de este partido.'}
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-white/5">
            {data.stats.map((stat) => (
              <StatRow key={stat.key} stat={stat} />
            ))}
          </ul>
        )}
      </div>

      {kind === 'event' && (
        <Link to={`/betting/partido/${id}`} className="btn-ghost">
          Ver mercados de apuestas
        </Link>
      )}
    </section>
  )
}
