import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

/** Iconos de trazo (24px, 1.75) propios, decorativos por defecto: el texto adyacente aporta el nombre accesible. */
function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </Icon>
)
export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
  </Icon>
)
export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
)
export const SparkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    <path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
  </Icon>
)
export const TrophyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 4h8v6a4 4 0 01-8 0V4z" />
    <path d="M8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4M12 14v4M8 21h8" />
  </Icon>
)
export const TicketIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 9a2 2 0 002-2h14a2 2 0 002 2v0a2 2 0 000 6v0a2 2 0 00-2 2H5a2 2 0 00-2-2v0a2 2 0 000-6z" />
    <path d="M14 7v10" strokeDasharray="2 2.5" />
  </Icon>
)
export const CogIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Icon>
)
export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
)
export const WalletIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 012-2h13v4" />
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <circle cx="16.5" cy="13.5" r="1" fill="currentColor" />
  </Icon>
)
export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </Icon>
)
export const ChevronIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)
