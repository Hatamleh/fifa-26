export interface Team {
  id: number
  name: string
  slug: string
  code: string
  /** Emoji flag, e.g. "🇧🇷". */
  flag: string
  continent: string
  confederation: string
  /** True for the four teams playing their first ever World Cup in 2026. */
  isDebut: boolean
  /** World Cups won, counting 2026. 0 for teams that have never won. */
  titles: number
  /** Winning years, comma-separated. Empty string when titles is 0. */
  titleYears: string
}

/** The shape GET /api/v1/teams returns. */
export interface TeamsResponse {
  teams: Team[]
}
