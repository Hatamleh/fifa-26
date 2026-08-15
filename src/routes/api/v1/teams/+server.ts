import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { teamRepository } from '$lib/server/repositories/team.repository'

/**
 * GET /api/v1/teams          — all 48 qualified teams, A→Z.
 * GET /api/v1/teams?search=  — the ones matching the term.
 *
 * 200 -> { teams: Team[] }
 *
 * The page calls this from the browser rather than through a server `load`,
 * so the request is visible to the network layer and can be stubbed.
 */
export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get('search') ?? undefined
  return json({ teams: await teamRepository.list(search) })
}
