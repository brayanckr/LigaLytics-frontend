import axiosClient from './axiosClient'
import type {
  DataStatusDto,
  EtlSeasonResult,
  FixtureDto,
  HealthResponse,
  PredictionRecord,
  PredictionRequest,
  PredictionResponseDto,
  RankingEntryDto,
  SeasonDto,
  TeamDto,
  TeamStatsDto,
  TrainingReport,
} from '../types'

const ADMIN_KEY_STORAGE = 'ligalytics.adminKey'

/** Clave de administración guardada solo en esta pestaña (sessionStorage). */
export const adminKeyStore = {
  get(): string {
    try {
      return sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? ''
    } catch {
      return ''
    }
  },
  set(value: string): void {
    try {
      if (value) {
        sessionStorage.setItem(ADMIN_KEY_STORAGE, value)
      } else {
        sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      }
    } catch {
      // sessionStorage no disponible: la clave solo vive mientras dure el formulario
    }
  },
}

function adminHeaders(): Record<string, string> {
  const key = adminKeyStore.get()
  return key ? { 'X-Admin-Key': key } : {}
}

/**
 * Punto único de acceso a la API REST de LigaLytics. Todas las llamadas pasan
 * por el axiosClient compartido (baseURL /api, timeouts e interceptores).
 */
export const ligalyticsApi = {
  getHealth: (): Promise<HealthResponse> =>
    axiosClient.get<HealthResponse>('/health').then((response) => response.data),

  getTeams: (query?: string): Promise<TeamDto[]> =>
    axiosClient
      .get<TeamDto[]>('/teams', { params: query ? { q: query } : undefined })
      .then((response) => response.data),

  getTeamStats: (teamId: number, season?: number): Promise<TeamStatsDto> =>
    axiosClient
      .get<TeamStatsDto>(`/teams/${teamId}/stats`, { params: season ? { season } : undefined })
      .then((response) => response.data),

  getSeasons: (): Promise<SeasonDto[]> =>
    axiosClient.get<SeasonDto[]>('/seasons').then((response) => response.data),

  getRanking: (season?: number): Promise<RankingEntryDto[]> =>
    axiosClient
      .get<RankingEntryDto[]>('/ranking', { params: season ? { season } : undefined })
      .then((response) => response.data),

  predict: (payload: PredictionRequest): Promise<PredictionResponseDto> =>
    axiosClient.post<PredictionResponseDto>('/predict', payload).then((response) => response.data),

  getFixtures: (from: string, to: string): Promise<FixtureDto[]> =>
    axiosClient
      .get<FixtureDto[]>("/fixtures", {
        params: { from, to, zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      })
      .then((response) => response.data),

  getPredictionHistory: (): Promise<PredictionRecord[]> =>
    axiosClient.get<PredictionRecord[]>('/predict/history').then((response) => response.data),

  /** Métricas de validación del modelo; devuelve null si todavía no se entrenó. */
  getModelReport: (): Promise<TrainingReport | null> =>
    axiosClient
      .get<TrainingReport>('/model/report')
      .then((response) => response.data)
      .catch((error) => {
        if (error?.response?.status === 404) {
          return null
        }
        throw error
      }),

  // ── Administración ─────────────────────────────────────────────

  getDataStatus: (): Promise<DataStatusDto> =>
    axiosClient.get<DataStatusDto>('/admin/status', { headers: adminHeaders() }).then((response) => response.data),

  loadFootballData: (seasons?: string[]): Promise<EtlSeasonResult[]> =>
    axiosClient
      .post<EtlSeasonResult[]>('/admin/etl/football-data', null, {
        headers: adminHeaders(),
        params: seasons && seasons.length > 0 ? { seasons: seasons.join(',') } : undefined,
        timeout: 300000,
      })
      .then((response) => response.data),

  /** Sube uno o varios CSV de football-data descargados a mano. */
  uploadFootballData: (files: File[]): Promise<EtlSeasonResult[]> => {
    const form = new FormData()
    files.forEach((file) => form.append("files", file))
    return axiosClient
      .post<EtlSeasonResult[]>("/admin/etl/football-data/upload", form, {
        headers: { ...adminHeaders(), "Content-Type": "multipart/form-data" },
        timeout: 300000,
      })
      .then((response) => response.data)
  },

  /** Sube paginas de Understat guardadas como HTML (una por temporada). */
  uploadUnderstat: (files: File[]): Promise<EtlSeasonResult[]> => {
    const form = new FormData()
    files.forEach((file) => form.append("files", file))
    return axiosClient
      .post<EtlSeasonResult[]>("/admin/etl/understat/upload", form, {
        headers: { ...adminHeaders(), "Content-Type": "multipart/form-data" },
        timeout: 300000,
      })
      .then((response) => response.data)
  },

  loadUnderstat: (seasons?: string[]): Promise<EtlSeasonResult[]> =>
    axiosClient
      .post<EtlSeasonResult[]>('/admin/etl/understat', null, {
        headers: adminHeaders(),
        params: seasons && seasons.length > 0 ? { seasons: seasons.join(',') } : undefined,
        timeout: 300000,
      })
      .then((response) => response.data),

  loadTransfermarkt: (): Promise<EtlSeasonResult> =>
    axiosClient
      .post<EtlSeasonResult>('/admin/etl/transfermarkt', null, { headers: adminHeaders(), timeout: 120000 })
      .then((response) => response.data),

  trainModel: (): Promise<TrainingReport> =>
    axiosClient
      .post<TrainingReport>('/admin/train', null, { headers: adminHeaders(), timeout: 300000 })
      .then((response) => response.data),
}

export default ligalyticsApi
