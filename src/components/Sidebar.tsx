import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronIcon, CollapseIcon, ExpandIcon, ShieldIcon } from './icons'
import { LEAGUES, NAV_ITEMS } from './navItems'

const COLLAPSED_KEY = 'ligalytics.sidebar.collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/** Barra lateral colapsable (≥ lg): navegación principal y acordeón de ligas. En móvil la reemplaza BottomNav. */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [leaguesOpen, setLeaguesOpen] = useState(true)
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  // Indicador compartido: mide el ítem activo y traslada la pastilla con transform (sin tocar layout).
  // La primera colocación se hace sin transición para que no «vuele» desde la esquina.
  useLayoutEffect(() => {
    const pill = pillRef.current
    const active = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]')
    if (!pill) return
    if (!active) {
      pill.style.opacity = '0'
      return
    }
    pill.style.opacity = '1'
    pill.style.height = `${active.offsetHeight}px`
    if (!placed.current) {
      pill.style.transition = 'none'
      pill.style.transform = `translateY(${active.offsetTop}px)`
      void pill.offsetHeight
      pill.style.transition = ''
      placed.current = true
    } else {
      pill.style.transform = `translateY(${active.offsetTop}px)`
    }
  }, [pathname])

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        // sin almacenamiento: el estado solo dura mientras la pagina siga abierta
      }
      return next
    })
  }

  // Ítems principales: el fondo activo lo pinta la pastilla compartida, no cada enlace.
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-150',
      isActive ? 'text-sky-300' : 'text-slate-400 hover:bg-white/[.04] hover:text-white',
    ].join(' ')

  const leagueClass = ({ isActive }: { isActive: boolean }) =>
    [
      'group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-150',
      isActive ? 'bg-sky-500/10 text-sky-300' : 'text-slate-400 hover:bg-white/[.04] hover:text-white',
    ].join(' ')

  return (
    <aside
      data-collapsed={collapsed}
      className={`sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-white/5 bg-slate-900/60 p-3 transition-[width] duration-300 ease-out lg:flex ${
        collapsed ? 'w-[4.75rem]' : 'w-64'
      }`}
      style={{ transitionDuration: 'var(--dur-sidebar)', transitionTimingFunction: 'var(--ease-snap)' }}
    >
      <nav ref={navRef} aria-label="Principal" className="relative space-y-1">
        <span ref={pillRef} aria-hidden="true" className="nav-pill" style={{ opacity: 0 }} />
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} title={collapsed ? label : undefined}>
            {({ isActive }) => (
              <>
                <Icon className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-sky-400' : ''}`} />
                <span className="nav-label">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="mt-5 border-t border-white/5 pt-4 motion-safe:animate-fade-in">
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
                    <NavLink to="/ranking" className={leagueClass}>
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
      )}

      <button
        type="button"
        onClick={toggle}
        aria-pressed={collapsed}
        aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        title={collapsed ? 'Expandir menú' : undefined}
        className={`sticky bottom-0 mt-auto flex min-h-[44px] items-center gap-3 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm font-semibold text-slate-400 transition-colors duration-150 hover:border-sky-500/60 hover:text-white active:scale-95`}
      >
        {collapsed ? <ExpandIcon className="shrink-0" /> : <CollapseIcon className="shrink-0" />}
        <span className="nav-label">Contraer</span>
      </button>
    </aside>
  )
}
