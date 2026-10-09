import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-5xl font-black text-sky-400">404</p>
      <h1 className="text-xl font-bold text-white">Página no encontrada</h1>
      <p className="max-w-md text-sm text-slate-400">
        La ruta que buscas no existe o fue movida. Vuelve al inicio para seguir explorando LigaLytics.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400"
      >
        Ir al inicio
      </Link>
    </section>
  )
}
