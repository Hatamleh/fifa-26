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
  /** How many fans have backed this team, across everyone. */
  likes: number
  /**
   * Whether *this* fan backed it. Always false when the request carried no
   * `x-fan-id` header — the API has no other way to know who is asking.
   */
  liked: boolean
}

/** The shape GET /api/v1/teams returns. */
export interface TeamsResponse {
  teams: Team[]
}

/** The shape PUT /api/v1/teams/[code]/like returns. */
export interface LikeResponse {
  code: string
  likes: number
  liked: boolean
}
