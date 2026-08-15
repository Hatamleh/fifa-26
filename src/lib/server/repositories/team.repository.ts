import { prisma } from '$lib/server/db'
import type { Team } from '$lib/types'

export class TeamRepository {
  /**
   * All 48 teams, or the ones matching `search`.
   *
   * The term is matched against the name, the ASCII-folded slug, the FIFA
   * code, the continent and the confederation, so "bra", "BRA", "south am"
   * and "uefa" all narrow the list. Prisma's `contains` compiles to SQLite
   * LIKE, which is already case-insensitive for ASCII.
   */
  async list(search?: string): Promise<Team[]> {
    const term = search?.trim()

    return prisma.team.findMany({
      where: term
        ? {
            OR: [
              { name: { contains: term } },
              { slug: { contains: term } },
              { code: { contains: term } },
              { continent: { contains: term } },
              { confederation: { contains: term } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    })
  }
}

export const teamRepository = new TeamRepository()
