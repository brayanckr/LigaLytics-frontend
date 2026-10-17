import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronIcon, ShieldIcon } from './icons'
import { LEAGUES, NAV_ITEMS } from './navItems'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-semibold transition',
    isActive
      ? 'bg-sky-500/15 text-sky-300'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ')

/** Barra lateral (≥ lg): navegación principal y acordeón de ligas. */
export default function Sidebar() {
  const [leaguesOpen, setLeaguesOpen] = useState(true)

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-700/60 bg-slate-900 p-3 lg:block">
      <nav aria-label="Principal" className="space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-5 border-t border-slate-700/60 pt-4">
        <button
          type="button"
          onClick={() => setLeaguesOpen((open) => !open)}
          aria-expanded={leaguesOpen}
          aria-controls="sidebar-leagues"
          className="flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
        >
          Ligas
          <ChevronIcon className={`transition-transform duration-200 ${leaguesOpen ? 'rotate-180' : ''}`} />
        </button>
        {leaguesOpen && (
          <ul id="sidebar-leagues" className="mt-1 space-y-1">
            {LEAGUES.map((league) => (
              <li key={league.name}>
                {league.available ? (
                  <NavLink to="/ranking" className={linkClass}>
                    <ShieldIcon />
                    {league.name}
                  </NavLink>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500"
                  >
                    <ShieldIcon />
                    {league.name}
                    <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                      Pronto
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
