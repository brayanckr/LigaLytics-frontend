import { useEffect } from 'react'
import type { TeamDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import { formatDate, formatDecimal, formatMarketValue } from '../lib/format'
import ErrorAlert from './ErrorAlert'
import Spinner from './Spinner'
import { teamInitials } from './TeamCard'

interface TeamDetailModalProps {
  team: TeamDto
  onClose: () => void
}

interface StatItemProps {
  label: string
  value: string
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-800/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function formClass(letter: string): string {
  if (letter === 'W') {
    return 'bg-emerald-500/20 text-emerald-300'
  }
  return letter === 'D' ? 'bg-slate-600/50 text-slate-200' : 'bg-rose-500/20 text-rose-300'
}

export default function TeamDetailModal({ team, onClose }: TeamDetailModalProps) {
  const { data, loading, error, reload } = useApi(() => ligalyticsApi.getTeamStats(team.id), [team.id])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-base font-bold text-sky-300">
              {teamInitials(team.name)}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">{team.name}</h2>
              <p className="text-sm text-slate-400">{team.stadium ?? 'Estadio desconocido'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-6 p-6">
          {loading && <Spinner label="Cargando estadísticas…" />}
          {!loading && error && <ErrorAlert message={error} onRetry={reload} />}

          {!loading && !error && data && (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                {data.season && <span>Temporada {data.season}</span>}
                {data.recentForm && (
                  <span className="flex items-center gap-1">
                    Forma:
                    {data.recentForm.split('').map((letter, index) => (
                      <span
                        key={index}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${formClass(letter)}`}
                      >
                        {letter === 'W' ? 'G' : letter === 'D' ? 'E' : 'P'}
                      </span>
                    ))}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatItem label="Partidos" value={String(data.matchesPlayed)} />
                <StatItem label="Puntos" value={String(data.points)} />
                <StatItem label="Victorias" value={String(data.wins)} />
                <StatItem label="Empates" value={String(data.draws)} />
                <StatItem label="Derrotas" value={String(data.losses)} />
                <StatItem label="GF / GC" value={`${data.goalsFor} / ${data.goalsAgainst}`} />
                <StatItem label="Media goles" value={formatDecimal(data.averageGoalsFor)} />
                <StatItem label="Valor plantilla" value={formatMarketValue(data.marketValue)} />
                <StatItem label="Media córneres" value={formatDecimal(data.averageCorners)} />
                <StatItem label="Media tarjetas" value={formatDecimal(data.averageYellowCards)} />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Últimos partidos
                </h3>
                {data.recentMatches.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay partidos registrados.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="min-w-full divide-y divide-slate-800 text-sm">
                      <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-4 py-2 text-left">Fecha</th>
                          <th className="px-4 py-2 text-left">Partido</th>
                          <th className="px-4 py-2 text-center">Resultado</th>
                          <th className="px-4 py-2 text-center">xG</th>
                          <th className="px-4 py-2 text-center">Córneres</th>
                          <th className="px-4 py-2 text-center">Tarjetas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {data.recentMatches.map((match) => (
                          <tr key={match.matchId} className="hover:bg-slate-800/40" title={match.description}>
                            <td className="whitespace-nowrap px-4 py-2 text-slate-400">{formatDate(match.date)}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-slate-200">
                              {match.homeTeam} vs {match.awayTeam}
                            </td>
                            <td className="px-4 py-2 text-center font-medium text-white">
                              {match.homeGoals ?? '-'} - {match.awayGoals ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-center text-slate-300">
                              {match.homeXg ?? '-'} / {match.awayXg ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-center text-slate-300">{match.corners ?? '-'}</td>
                            <td className="px-4 py-2 text-center text-slate-300">{match.yellowCards ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
