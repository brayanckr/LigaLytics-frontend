import { NavLink } from 'react-router-dom'
import { BOTTOM_ITEMS } from './navItems'

/** Navegación inferior para pantallas < lg (máx. 5 destinos, icono + etiqueta). */
export default function BottomNav() {
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-700/60 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {BOTTOM_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
                  isActive ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <Icon />
              <span className="max-w-full truncate px-1">{label.replace(' (demo)', '')}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
