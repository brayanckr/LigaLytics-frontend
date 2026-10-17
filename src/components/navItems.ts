import type { ComponentType, SVGProps } from 'react'
import { CalendarIcon, CogIcon, HomeIcon, ShieldIcon, SparkIcon, TicketIcon, TrophyIcon } from './icons'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: HomeIcon, end: true },
  { to: '/betting', label: 'Apuestas (demo)', icon: TicketIcon },
  { to: '/predict', label: 'IA Predictor', icon: SparkIcon },
  { to: '/calendar', label: 'Calendario', icon: CalendarIcon },
  { to: '/ranking', label: 'Clasificación', icon: TrophyIcon },
  { to: '/teams', label: 'Equipos', icon: ShieldIcon },
  { to: '/admin', label: 'Administración', icon: CogIcon },
]

/** Navegación inferior en móvil: máximo 5 destinos de primer nivel. */
export const BOTTOM_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  ['/', '/betting', '/predict', '/calendar', '/ranking'].includes(item.to),
)

export interface LeagueItem {
  name: string
  available: boolean
}

/** Solo LaLiga tiene datos hoy; el resto se muestra como «Pronto» para no aparentar cobertura que no existe. */
export const LEAGUES: LeagueItem[] = [
  { name: 'LaLiga', available: true },
  { name: 'Premier League', available: false },
  { name: 'Champions League', available: false },
  { name: 'Serie A', available: false },
]
