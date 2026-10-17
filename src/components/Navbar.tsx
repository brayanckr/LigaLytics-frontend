import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { cop } from '../betting/shared'
import { CogIcon, SearchIcon, UserIcon, WalletIcon } from './icons'

/** Cabecera superior: logo, buscador rápido de equipos al centro y accesos de cuenta/saldo/ajustes a la derecha. */
export default function Navbar() {
  const { account } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = query.trim()
    navigate(text ? `/teams?q=${encodeURIComponent(text)}` : '/teams')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="LigaLytics, inicio">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-base font-black text-white shadow-glow">
            L
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-white sm:block">
            Liga<span className="text-sky-500">Lytics</span>
          </span>
        </Link>

        <form onSubmit={submit} role="search" className="relative mx-auto min-w-0 max-w-xl flex-1">
          <label htmlFor="global-search" className="sr-only">
            Buscar equipos o ligas
          </label>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar equipos o ligas…"
            className="h-11 w-full rounded-full border border-slate-700 bg-slate-800 pl-10 pr-4 text-sm text-white placeholder-slate-400 transition focus:border-sky-500"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2">
          {account && (
            <Link
              to="/betting/mis-apuestas"
              className="flex h-11 items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 text-sm font-bold tabular-nums text-lime-400 transition hover:border-sky-500"
            >
              <WalletIcon />
              <span className="hidden sm:inline">{cop(account.balance)}</span>
              <span className="sr-only">Saldo ficticio {cop(account.balance)}</span>
            </Link>
          )}
          <NavLink
            to={account ? '/betting' : '/login'}
            className="btn-primary !rounded-full !px-3 sm:!px-4"
            aria-label={account ? account.displayName : 'Iniciar sesión'}
          >
            <UserIcon />
            <span className="hidden sm:inline">{account ? account.displayName : 'Entrar'}</span>
          </NavLink>
          <NavLink
            to="/admin"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-800 hover:text-white md:flex"
            aria-label="Administración"
          >
            <CogIcon />
          </NavLink>
        </div>
      </div>
    </header>
  )
}
