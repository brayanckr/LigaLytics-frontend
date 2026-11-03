import type { ComponentType, SVGProps } from 'react'
import {
  CalendarIcon,
  CogIcon,
  HomeIcon,
  LiveIcon,
  MyBetsIcon,
  ProfileIcon,
  ShieldIcon,
  SparkIcon,
  StatsIcon,
  TicketIcon,
} from './icons'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: HomeIcon, end: true },
  { to: '/matches', label: 'Próximos Partidos', icon: LiveIcon },
  { to: '/predict', label: 'Predicciones', icon: SparkIcon },
  { to: '/betting', label: 'Apuestas (demo)', icon: TicketIcon, end: true },
  { to: '/betting/mis-apuestas', label: 'Mis Apuestas', icon: MyBetsIcon },
  { to: '/ranking', label: 'Estadísticas', icon: StatsIcon },
  { to: '/calendar', label: 'Calendario', icon: CalendarIcon },
  { to: '/teams', label: 'Equipos', icon: ShieldIcon },
  { to: '/profile', label: 'Perfil', icon: ProfileIcon },
  { to: '/admin', label: 'Administración', icon: CogIcon },
]

/** Navegación inferior en móvil: máximo 5 destinos de primer nivel. */
export const BOTTOM_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  ['/', '/predict', '/betting/mis-apuestas', '/ranking', '/profile'].includes(item.to),
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
