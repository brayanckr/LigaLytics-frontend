import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import { formatDate } from '../lib/format'
import ErrorAlert from './ErrorAlert'
import Spinner from './Spinner'

interface HeadToHeadPanelProps {
  homeId: number
  awayId: number
}

/** Últimos enfrentamientos directos entre los dos equipos seleccionados. */
export default function HeadToHeadPanel({ homeId, awayId }: HeadToHeadPanelProps) {
  const { data, loading, error, reload } = useApi(
    () => ligalyticsApi.getHeadToHead(homeId, awayId, 10),
    [homeId, awayId],
  )

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-800/40 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Últimos enfrentamientos</h2>

      {loading && <Spinner label="Cargando enfrentamientos…" />}
      {!loading && error && <ErrorAlert message={error} onRetry={reload} />}

      {!loading && !error && data && data.summary.played === 0 && (
        <p className="text-sm text-slate-400">
          No hay enfrentamientos de {data.teamA} y {data.teamB} en los datos cargados.
        </p>
      )}

      {!loading && !error && data && data.summary.played > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Summary label={`Victorias ${data.teamA}`} value={String(data.summary.winsA)} tone="text-sky-300" />
            <Summary label="Empates" value={String(data.summary.draws)} tone="text-slate-200" />
            <Summary label={`Victorias ${data.teamB}`} value={String(data.summary.winsB)} tone="text-violet-300" />
            <Summary label="Goles por partido" value={data.summary.averageTotalGoals.toFixed(2)} tone="text-white" />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Temporada</th>
                  <th className="px-4 py-2 text-right">Local</th>
                  <th className="px-4 py-2 text-center">Resultado</th>
                  <th className="px-4 py-2 text-left">Visitante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.matches.map((match) => {
                  const homeWon = match.homeGoals > match.awayGoals
                  const awayWon = match.homeGoals < match.awayGoals
                  return (
                    <tr key={`${match.date}-${match.homeTeam}`} className="hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-4 py-2 text-slate-400">{formatDate(match.date)}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-slate-400">{match.season}</td>
                      <td className={`px-4 py-2 text-right ${homeWon ? 'font-semibold text-white' : 'text-slate-300'}`}>
                        {match.homeTeam}
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-sky-300">
                        {match.homeGoals} - {match.awayGoals}
                      </td>
                      <td className={`px-4 py-2 ${awayWon ? 'font-semibold text-white' : 'text-slate-300'}`}>
                        {match.awayTeam}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            {data.summary.played} partidos de LaLiga desde 2020 en cualquiera de las dos sedes.
          </p>
        </>
      )}
    </div>
  )
}

function Summary({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  )
}
