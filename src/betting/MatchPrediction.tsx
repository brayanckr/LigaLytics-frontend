import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BettingMatchDto, PredictionResponseDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { describeOutcome, formatPercent } from '../lib/format'

type PredictableMatch = Pick<BettingMatchDto, 'homeTeam' | 'awayTeam' | 'hasModel' | 'homeTeamId' | 'awayTeamId'>

export function canPredict(match: PredictableMatch): boolean {
  return match.hasModel && match.homeTeamId !== null && match.awayTeamId !== null
}

/** Predicción del modelo de IA para un partido de la cartelera, calculada al abrirla. */
export default function MatchPrediction({ match }: { match: PredictableMatch }) {
  const [prediction, setPrediction] = useState<PredictionResponseDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (match.homeTeamId === null || match.awayTeamId === null) {
      return
    }
    let active = true
    setPrediction(null)
    setError(null)
    ligalyticsApi
      .predict({ homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId })
      .then((result) => active && setPrediction(result))
      .catch((cause) => active && setError(extractApiError(cause)))
    return () => {
      active = false
    }
  }, [match.homeTeamId, match.awayTeamId, attempt])

  if (error) {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-rose-300">
        <span>No se pudo calcular la predicción: {error}</span>
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="text-sky-300 underline-offset-2 hover:underline">
          Reintentar
        </button>
      </div>
    )
  }
  if (!prediction) {
    return (
      <p role="status" className="text-sm text-slate-400">
        Calculando predicción…
      </p>
    )
  }

  const segments = [
    { key: '1', label: match.homeTeam, value: prediction.homeWinProbability, bar: 'bg-sky-400', text: 'text-sky-300' },
    { key: 'X', label: 'Empate', value: prediction.drawProbability, bar: 'bg-slate-400', text: 'text-slate-200' },
    { key: '2', label: match.awayTeam, value: prediction.awayWinProbability, bar: 'bg-violet-400', text: 'text-violet-300' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-400">Resultado más probable</p>
        <p className="text-lg font-bold text-white">
          {describeOutcome(prediction.predictedOutcome)}
          <span className="ml-3 text-sm font-normal text-slate-400">marcador probable {prediction.mostLikelyScore}</span>
        </p>
      </div>

      <div>
        <div
          className="flex h-2 overflow-hidden rounded-full bg-slate-800"
          role="img"
          aria-label={segments.map((s) => `${s.label} ${formatPercent(s.value)}`).join(', ')}
        >
          {segments.map((s) => (
            <span key={s.key} className={s.bar} style={{ width: `${s.value * 100}%` }} />
          ))}
        </div>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
          {segments.map((s) => (
            <div key={s.key} className="min-w-0">
              <dt className="truncate text-xs text-slate-400">
                {s.key} · {s.label}
              </dt>
              <dd className={`font-semibold tabular-nums ${s.text}`}>{formatPercent(s.value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300">
        <li>{describeOutcome(prediction.goalsOutcome)}</li>
        <li>{describeOutcome(prediction.cornersOutcome)}</li>
        <li>{describeOutcome(prediction.cardsOutcome)}</li>
        <li>
          Ambos marcan <strong className="tabular-nums text-white">{formatPercent(prediction.bothTeamsScoreProbability)}</strong>
        </li>
      </ul>

      <p className="text-xs text-slate-500">
        Es una estimación del modelo, no una garantía. Las apuestas de esta sección usan saldo ficticio.
      </p>
      <Link
        to={`/predict?home=${prediction.homeTeamId}&away=${prediction.awayTeamId}`}
        className="inline-block text-sm text-sky-300 hover:underline"
      >
        Ver análisis completo ›
      </Link>
    </div>
  )
}
