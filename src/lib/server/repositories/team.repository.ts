import { prisma } from '$lib/server/db'
import type { LikeResponse, Team } from '$lib/types'

export class TeamRepository {
  /**
   * All 48 teams, or the ones matching `search`.
   *
   * The term is matched against the name, the ASCII-folded slug, the FIFA
   * code, the continent and the confederation, so "bra", "BRA", "south am"
   * and "uefa" all narrow the list. Prisma's `contains` compiles to SQLite
   * LIKE, which is already case-insensitive for ASCII.
   *
   * `fanId` is optional. With one, every team carries whether that fan has
   * backed it, so a reload restores the filled-in buttons; without one every
   * `liked` is false.
   */
  async list(search?: string, fanId?: string): Promise<Team[]> {
    const term = search?.trim()

    const teams = await prisma.team.findMany({
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

    // One extra query for the whole page rather than one per card.
    const likedCodes = fanId
      ? new Set(
          (
            await prisma.like.findMany({
              where: { fanId, teamCode: { in: teams.map((team) => team.code) } },
              select: { teamCode: true },
            })
          ).map((like) => like.teamCode),
        )
      : new Set<string>()

    return teams.map((team) => ({ ...team, liked: likedCodes.has(team.code) }))
  }

  /**
   * Back a team, or take it back. Idempotent by design: the desired state
   * arrives in the body, so sending `{ liked: true }` twice leaves one row and
   * one like, and a retried request can never double-count.
   *
   * Returns null when `code` is not one of the 48 teams, which the route
   * turns into a 404.
   */
  async setLike(code: string, fanId: string, liked: boolean): Promise<LikeResponse | null> {
    const teamCode = code.toUpperCase()
    const team = await prisma.team.findUnique({ where: { code: teamCode } })
    if (!team) return null

    // The row write and the counter update have to agree, so they share a
    // transaction — a half-applied like would leave the count lying.
    const likes = await prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: { teamCode_fanId: { teamCode, fanId } },
      })

      if (liked && !existing) {
        await tx.like.create({ data: { teamCode, fanId } })
      } else if (!liked && existing) {
        await tx.like.delete({ where: { id: existing.id } })
      } else {
        return team.likes // already in the requested state; nothing to count
      }

      const count = await tx.like.count({ where: { teamCode } })
      await tx.team.update({ where: { code: teamCode }, data: { likes: count } })
      return count
    })

    return { code: teamCode, likes, liked }
  }
}

export const teamRepository = new TeamRepository()
