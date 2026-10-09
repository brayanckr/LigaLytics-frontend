import type { BetDto, ParlayDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import { formatDate } from '../lib/format'
import { STATUS_LABEL, cop, describeOffer } from './shared'

type Entry = { kind: 'single'; placedAt: string; bet: BetDto } | { kind: 'parlay'; placedAt: string; parlay: ParlayDto }

function Result({ status, stake, payout }: { status: BetDto['status']; stake: number; payout: number }) {
  const label = STATUS_LABEL[status]
  const net = status === 'PENDING' ? null : payout - stake
  return (
    <div className="text-right">
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${label.tone}`}>{label.text}</span>
      <p className={`mt-1 text-sm font-medium ${net === null ? 'text-slate-500' : net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
        {net === null ? '—' : `${net >= 0 ? '+' : ''}${cop(net)}`}
      </p>
    </div>
  )
}

/** Historial de la cuenta: apuestas simples y combinadas, de la más reciente a la más antigua. */
export default function MyBets() {
  const bets = useApi(() => ligalyticsApi.getBets(), [])
  const parlays = useApi(() => ligalyticsApi.getParlays(), [])

  if (bets.loading || parlays.loading) {
    return <Spinner label="Cargando tus apuestas…" />
  }
  const error = bets.error ?? parlays.error
  if (error) {
    return (
      <ErrorAlert
        message={error}
        onRetry={() => {
          bets.reload()
          parlays.reload()
        }}
      />
    )
  }

  const entries: Entry[] = [
    ...(bets.data ?? []).map((bet): Entry => ({ kind: 'single', placedAt: bet.placedAt, bet })),
    ...(parlays.data ?? []).map((parlay): Entry => ({ kind: 'parlay', placedAt: parlay.placedAt, parlay })),
  ].sort((a, b) => b.placedAt.localeCompare(a.placedAt))

  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">Todavía no has hecho ninguna apuesta.</p>
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) =>
        entry.kind === 'single' ? (
          <article key={`b${entry.bet.id}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <div className="min-w-0 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Simple · {formatDate(entry.placedAt)}</p>
              <p className="mt-1 font-semibold text-white">
                {describeOffer(entry.bet, entry.bet.homeTeam, entry.bet.awayTeam)}
              </p>
              <p className="text-slate-400">
                {entry.bet.homeTeam} vs {entry.bet.awayTeam} · {formatDate(entry.bet.kickoff)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Cuota <span className="text-emerald-300">{entry.bet.odds.toFixed(2)}</span>
                {entry.bet.oddsSource === 'demo' && <span className="ml-1 text-amber-300">demo</span>} · importe{' '}
                {cop(entry.bet.stake)}
              </p>
            </div>
            <Result status={entry.bet.status} stake={entry.bet.stake} payout={entry.bet.payout} />
          </article>
        ) : (
          <article key={`p${entry.parlay.id}`} className="space-y-3 rounded-xl border border-sky-500/30 bg-slate-800/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">
                <p className="text-xs uppercase tracking-wide text-sky-300">
                  Combinada ({entry.parlay.legs.length}) · {formatDate(entry.placedAt)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Cuota total <span className="text-emerald-300">{entry.parlay.totalOdds.toFixed(2)}</span> · importe{' '}
                  {cop(entry.parlay.stake)} · ganancia posible {cop(entry.parlay.potentialPayout)}
                </p>
              </div>
              <Result status={entry.parlay.status} stake={entry.parlay.stake} payout={entry.parlay.payout} />
            </div>
            <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/50 text-sm">
              {entry.parlay.legs.map((leg, index) => (
                <li key={index} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-slate-200">{describeOffer(leg, leg.homeTeam, leg.awayTeam)}</p>
                    <p className="truncate text-xs text-slate-500">
                      {leg.homeTeam} vs {leg.awayTeam} · {formatDate(leg.kickoff)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-emerald-300">{leg.odds.toFixed(2)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_LABEL[leg.status].tone}`}>
                      {STATUS_LABEL[leg.status].text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ),
      )}
    </div>
  )
}
