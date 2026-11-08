import { NavLink } from 'react-router-dom'
import { BOTTOM_ITEMS } from './navItems'

/** Navegación inferior para pantallas < lg (máx. 5 destinos, icono + etiqueta). */
export default function BottomNav() {
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-slate-900/85 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_-12px_rgba(0,0,0,.8)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {BOTTOM_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`absolute top-0 h-0.5 rounded-b-full bg-sky-500 shadow-glow transition-all duration-300 ${
                      isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                  <Icon className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5 scale-110' : ''}`} />
                  <span className="max-w-full truncate px-0.5">{label.replace(' (demo)', '')}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
