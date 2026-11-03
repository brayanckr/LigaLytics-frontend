/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Raíz del canal en vivo (SockJS); por defecto, la misma que la API. */
  readonly VITE_LIVE_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
