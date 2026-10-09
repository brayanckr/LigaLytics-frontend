import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { PredictionResponseDto, TeamDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import PredictionCharts from '../components/PredictionCharts'
import PredictionDetails from '../components/PredictionDetails'
import HeadToHeadPanel from '../components/HeadToHeadPanel'
import Spinner from '../components/Spinner'
import { describeOutcome, formatPercent } from '../lib/format'

const EMPTY_TEAMS: TeamDto[] = []

export default function PredictorPage() {
  const { data, loading: loadingTeams, error: teamsError, reload } = useApi(
    () => ligalyticsApi.getTeams(),
    [],
  )
  const teams = useMemo(() => data ?? EMPTY_TEAMS, [data])

  const [searchParams] = useSearchParams()
  const [homeId, setHomeId] = useState<number | ''>(searchParams.get('home') ? Number(searchParams.get('home')) : '')
  const [awayId, setAwayId] = useState<number | ''>(searchParams.get('away') ? Number(searchParams.get('away')) : '')
  const [prediction, setPrediction] = useState<PredictionResponseDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (teams.length >= 2) {
      setHomeId((current) => (current === '' ? teams[0].id : current))
      setAwayId((current) => (current === '' ? teams[1].id : current))
    }
  }, [teams])

  const sameTeam = homeId !== '' && awayId !== '' && homeId === awayId
  const canPredict = homeId !== '' && awayId !== '' && !sameTeam && !loading

  const handlePredict = async () => {
    if (!canPredict) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await ligalyticsApi.predict({
        homeTeamId: Number(homeId),
        awayTeamId: Number(awayId),
      })
      setPrediction(result)
    } catch (cause) {
      setPrediction(null)
      setError(extractApiError(cause))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Panel de predicciones</h1>
        <p className="text-sm text-slate-400">
          Selecciona dos equipos para estimar resultado, goles, córneres y tarjetas.
        </p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        {loadingTeams && <Spinner label="Cargando equipos…" />}
        {!loadingTeams && teamsError && <ErrorAlert message={teamsError} onRetry={reload} />}

        {!loadingTeams && !teamsError && (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Equipo local</span>
              <select
                value={homeId}
                onChange={(event) => setHomeId(event.target.value === '' ? '' : Number(event.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500"
              >
                <option value="">Selecciona equipo…</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} disabled={team.id === awayId}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <span className="hidden pb-2 text-center text-sm font-semibold text-slate-500 sm:block">vs</span>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Equipo visitante</span>
              <select
                value={awayId}
                onChange={(event) => setAwayId(event.target.value === '' ? '' : Number(event.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500"
              >
                <option value="">Selecciona equipo…</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} disabled={team.id === homeId}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handlePredict}
              disabled={!canPredict}
              className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:col-span-3"
            >
              {loading ? 'Calculando…' : 'Predecir partido'}
            </button>
          </div>
        )}

        {sameTeam && (
          <p className="mt-3 text-sm text-amber-300">El equipo local y el visitante deben ser distintos.</p>
        )}
      </div>

      {homeId !== '' && awayId !== '' && !sameTeam && (
        <HeadToHeadPanel homeId={Number(homeId)} awayId={Number(awayId)} />
      )}

      {loading && <Spinner label="Generando predicción…" />}
      {!loading && error && <ErrorAlert message={error} />}

      {!loading && !error && !prediction && (
        <p className="rounded-xl border border-dashed border-slate-700 px-5 py-10 text-center text-sm text-slate-400">
          Aún no hay predicción. Elige dos equipos y pulsa «Predecir partido».
        </p>
      )}

      {!loading && !error && prediction && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Resultado más probable</p>
              <p className="text-xl font-bold text-sky-300">{describeOutcome(prediction.predictedOutcome)}</p>
              <p className="mt-1 text-sm text-slate-400">
                {prediction.homeTeam} vs {prediction.awayTeam}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-slate-300">
                Local <strong className="text-sky-300">{formatPercent(prediction.homeWinProbability)}</strong>
              </span>
              <span className="text-slate-300">
                Empate <strong className="text-slate-200">{formatPercent(prediction.drawProbability)}</strong>
              </span>
              <span className="text-slate-300">
                Visitante <strong className="text-violet-300">{formatPercent(prediction.awayWinProbability)}</strong>
              </span>
              {prediction.fromCache && (
                <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-medium text-emerald-300">
                  caché
                </span>
              )}
            </div>
          </div>

          <PredictionCharts prediction={prediction} />
          <PredictionDetails prediction={prediction} />
        </div>
      )}
    </section>
  )
}
