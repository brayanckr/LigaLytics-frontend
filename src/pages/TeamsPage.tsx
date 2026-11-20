import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TeamDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import { useTeamCrests } from '../hooks/useTeamCrests'
import ErrorAlert from '../components/ErrorAlert'
import { SkeletonGrid } from '../components/Skeleton'
import TeamCard from '../components/TeamCard'
import TeamDetailModal from '../components/TeamDetailModal'
import TeamSearch from '../components/TeamSearch'

export default function TeamsPage() {
  const { data, loading, error, reload } = useApi(() => ligalyticsApi.getTeams(), [])
  const crests = useTeamCrests()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [selected, setSelected] = useState<TeamDto | null>(null)

  const teams = data ?? []
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return teams
    }
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(normalized) ||
        (team.stadium?.toLowerCase().includes(normalized) ?? false),
    )
  }, [teams, query])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl text-white sm:text-4xl">Equipos de LaLiga</h1>
          <p className="text-sm text-slate-400">
            {teams.length} {teams.length === 1 ? 'equipo' : 'equipos'} disponibles
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <TeamSearch
            teams={teams}
            crests={crests}
            onSelect={setSelected}
            initialQuery={query}
            onQueryChange={setQuery}
            placeholder="Buscar equipo (autocompletado)…"
          />
        </div>
      </header>

      {loading && <SkeletonGrid count={8} />}

      {!loading && error && <ErrorAlert message={error} onRetry={reload} />}

      {!loading && !error && filtered.length === 0 && (
        <p className="rounded-xl border border-slate-800 bg-slate-800/40 px-5 py-8 text-center text-sm text-slate-400">
          No se encontraron equipos para «{query}».
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} crest={team.crest ?? crests.get(team.id) ?? null} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && <TeamDetailModal team={selected} crest={selected.crest ?? crests.get(selected.id) ?? null} onClose={() => setSelected(null)} />}
    </section>
  )
}
