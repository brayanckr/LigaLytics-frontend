import { useState } from 'react'
import type { RankingEntryDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import { SkeletonRows } from '../components/Skeleton'

function positionClass(position: number, total: number): string {
  if (position <= 4) {
    return 'bg-sky-500/20 text-sky-300'
  }
  if (position > total - 3) {
    return 'bg-rose-500/20 text-rose-300'
  }
  return 'bg-slate-700/60 text-slate-300'
}

function RankingRow({ entry, total }: { entry: RankingEntryDto; total: number }) {
  return (
    <tr className="hover:bg-slate-800/40">
      <td className="px-4 py-3">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${positionClass(
            entry.position,
            total,
          )}`}
        >
          {entry.position}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 font-medium text-white">{entry.teamName}</td>
      <td className="px-4 py-3 text-center text-slate-300">{entry.matchesPlayed}</td>
      <td className="px-4 py-3 text-center text-slate-300">{entry.wins}</td>
      <td className="px-4 py-3 text-center text-slate-300">{entry.draws}</td>
      <td className="px-4 py-3 text-center text-slate-300">{entry.losses}</td>
      <td className="px-4 py-3 text-center text-slate-300">{entry.goalsFor}</td>
      <td className="px-4 py-3 text-center text-slate-300">{entry.goalsAgainst}</td>
      <td className="px-4 py-3 text-center text-slate-300">
        {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
      </td>
      <td className="px-4 py-3 text-center font-bold text-sky-300">{entry.points}</td>
    </tr>
  )
}

export default function RankingPage() {
  const seasons = useApi(() => ligalyticsApi.getSeasons(), [])
  const [season, setSeason] = useState<number | undefined>(undefined)
  const { data, loading, error, reload } = useApi(() => ligalyticsApi.getRanking(season), [season])
  const entries = data ?? []

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Clasificación de LaLiga</h1>
        <p className="text-sm text-slate-400">
          Tabla de posiciones
          {seasons.data && seasons.data.length > 0
            ? ` de la temporada ${
                seasons.data.find((item) => item.startYear === (season ?? seasons.data?.[0]?.startYear))?.label ?? ''
              }`
            : ''}
          {entries.length > 0 ? ` · ${Math.max(...entries.map((entry) => entry.matchesPlayed))} jornadas jugadas` : ''}.
        </p>
        {seasons.data && seasons.data.length > 0 && (
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300">
            Temporada
            <select
              value={season ?? ''}
              onChange={(event) => setSeason(event.target.value === '' ? undefined : Number(event.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white outline-none focus:border-sky-500"
            >
              <option value="">Más reciente ({seasons.data[0].label})</option>
              {seasons.data.map((item) => (
                <option key={item.startYear} value={item.startYear}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {loading && <SkeletonRows rows={8} columns={8} />}
      {!loading && error && <ErrorAlert message={error} onRetry={reload} />}

      {!loading && !error && entries.length === 0 && (
        <p className="rounded-xl border border-slate-800 bg-slate-800/40 px-5 py-10 text-center text-sm text-slate-400">
          Todavía no hay datos de clasificación.
        </p>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Equipo</th>
                <th className="px-4 py-3 text-center">PJ</th>
                <th className="px-4 py-3 text-center">G</th>
                <th className="px-4 py-3 text-center">E</th>
                <th className="px-4 py-3 text-center">P</th>
                <th className="px-4 py-3 text-center">GF</th>
                <th className="px-4 py-3 text-center">GC</th>
                <th className="px-4 py-3 text-center">DG</th>
                <th className="px-4 py-3 text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {entries.map((entry) => (
                <RankingRow key={entry.teamId} entry={entry} total={entries.length} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
