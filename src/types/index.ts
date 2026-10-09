export interface HealthResponse {
  status: string
  service: string
  timestamp: string
}

export interface TeamDto {
  id: number
  name: string
  stadium: string | null
  marketValue: number | null
}

export interface MatchSummaryDto {
  matchId: number
  date: string | null
  homeTeam: string
  awayTeam: string
  homeGoals: number | null
  awayGoals: number | null
  homeXg: number | null
  awayXg: number | null
  corners: number | null
  yellowCards: number | null
  redCards: number | null
  description: string
}

export interface TeamStatsDto {
  teamId: number
  teamName: string
  stadium: string | null
  marketValue: number | null
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
  averageGoalsFor: number
  averageGoalsAgainst: number
  averageCorners: number
  averageYellowCards: number
  recentMatches: MatchSummaryDto[]
  season: string | null
  recentForm: string
}

export interface PredictionRequest {
  homeTeamId: number
  awayTeamId: number
}

export interface PredictionResponseDto {
  homeTeamId: number
  homeTeam: string
  awayTeamId: number
  awayTeam: string
  predictedOutcome: string
  homeWinProbability: number
  drawProbability: number
  awayWinProbability: number
  expectedHomeGoals: number
  expectedAwayGoals: number
  goalsOutcome: string
  mostLikelyScore: string
  expectedCorners: number
  cornersOutcome: string
  expectedCards: number
  cardsOutcome: string
  expectedHomeYellowCards: number
  expectedAwayYellowCards: number
  expectedHomeRedCards: number
  expectedAwayRedCards: number
  strategies: Record<string, string>
  dataSeason: string | null
  fromCache: boolean
  generatedAt: string
}

export interface RankingEntryDto {
  position: number
  teamId: number
  teamName: string
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  details: Record<string, string>
}

export interface SeasonDto {
  startYear: number
  label: string
  code: string
  matches: number
}

export interface DataStatusDto {
  teams: number
  matches: number
  firstMatch: string | null
  lastMatch: string | null
}

export interface EtlSummary {
  source: string
  reference: string
  fetched: number
  parsed: number
  created: number
  updated: number
  skipped: number
  location: string
}

export interface EtlSeasonResult {
  season: string
  success: boolean
  summary: EtlSummary | null
  error: string | null
}

export interface TargetResult {
  target: string
  algorithm: string
  trained: boolean
  trainInstances: number
  testInstances: number
  metricName: string
  metric: number | null
  baseline: number | null
  modelPath: string | null
  message: string
}

export interface TrainingReport {
  trainedAt: string
  matchCount: number
  evaluation: string
  results: TargetResult[]
}

export interface PredictionRecord {
  id: number
  createdAt: string
  homeTeam: string
  awayTeam: string
  predictedOutcome: string
  homeWinProbability: number
  drawProbability: number
  awayWinProbability: number
}

export interface FixtureDto {
  id: string
  utcDate: string
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'OTHER'
  matchday: number | null
  homeTeam: string
  awayTeam: string
  homeTeamId: number | null
  awayTeamId: number | null
  homeCrest: string | null
  awayCrest: string | null
  homeGoals: number | null
  awayGoals: number | null
}
