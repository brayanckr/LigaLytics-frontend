/** Marco fino de 2px en sky-500 alrededor del hero del Dashboard y del viewport de Login. Ponlo en false para desactivarlo. */
export const SHOW_FRAME = true

/**
 * Fondo del hero: líneas de campo en perspectiva (trazo blanco al ~6 %, como el fondo del logo), degradado navy desde la
 * izquierda (vertical en móvil) y halo cian arriba a la derecha. Es decorativo: no recibe foco ni lo lee un lector de pantalla.
 */
export default function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.06"
        strokeWidth="2"
      >
        <path d="M150 700 L330 150 H870 L1050 700 Z" />
        <path d="M95 430 H1105" />
        <ellipse cx="600" cy="430" rx="210" ry="70" />
        <circle cx="600" cy="430" r="4" fill="#ffffff" fillOpacity="0.06" />
        <path d="M335 700 L385 560 H815 L865 700" />
        <path d="M480 700 L500 630 H700 L720 700" />
        <path d="M385 150 L405 215 H795 L815 150" />
      </svg>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(44rem 26rem at 100% -10%, rgba(18,192,238,.16), transparent 62%)' }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(6,18,28,.92) 0%, rgba(6,18,28,.6) 45%, rgba(6,18,28,.15) 75%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-0 md:hidden"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(6,18,28,.55) 0%, rgba(6,18,28,.92) 100%)' }}
      />
    </div>
  )
}
