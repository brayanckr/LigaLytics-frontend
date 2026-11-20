import type { TeamDto } from '../types'
import { formatMarketValue } from '../lib/format'
import Crest from '../betting/Crest'

interface TeamCardProps {
  team: TeamDto
  onSelect: (team: TeamDto) => void
  /** Escudo oficial del equipo; si falta se muestran las iniciales. */
  crest?: string | null
}

export default function TeamCard({ team, onSelect, crest = null }: TeamCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(team)}
      className="group flex h-full flex-col items-start gap-4 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-sky-500/50 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <div className="flex w-full items-center gap-3">
        <Crest name={team.name} size="xl" src={crest} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white group-hover:text-sky-200">{team.name}</p>
          <p className="truncate text-xs text-slate-400">{team.stadium ?? 'Estadio desconocido'}</p>
        </div>
      </div>
      <div className="text-xs text-slate-400">
        Valor de plantilla:{' '}
        <span className="font-medium text-slate-200">{formatMarketValue(team.marketValue)}</span>
      </div>
    </button>
  )
}
