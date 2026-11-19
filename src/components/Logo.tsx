/** Emblema del logo de LaLiga Lytics (PNG con transparencia; decorativo: el texto vivo va al lado). */
export function LogoMark({ className = 'h-9 md:h-10' }: { className?: string }) {
  return <img src="/brand/logo-mark.png" alt="" width={230} height={233} className={`w-auto select-none ${className}`} draggable={false} />
}

/** Wordmark en texto vivo: «LaLiga» en blanco y «LYTICS» en cursiva con el degradado de marca. */
export function Wordmark({ className = 'text-lg md:text-xl' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-sans font-extrabold leading-none tracking-tight ${className}`}>
      <span className="text-white">LaLiga</span>
      <span className="text-brand-gradient pr-[.12em] italic tracking-wider">LYTICS</span>
    </span>
  )
}

/** Logo completo (emblema + wordmark rasterizado) para pantallas grandes: login y hero. Alt con el nombre de la marca. */
export function LogoFull({ className = 'w-[280px] sm:w-[340px]' }: { className?: string }) {
  return (
    <img
      src="/brand/logo-full.png"
      alt="LaLiga Lytics"
      width={600}
      height={240}
      className={`h-auto select-none drop-shadow-[0_0_28px_rgba(18,192,238,.25)] ${className}`}
      draggable={false}
    />
  )
}
