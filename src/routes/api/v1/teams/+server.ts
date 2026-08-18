import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { teamRepository } from '$lib/server/repositories/team.repository'

/**
 * GET /api/v1/teams          — all 48 qualified teams, A→Z.
 * GET /api/v1/teams?search=  — the ones matching the term.
 *
 * 200 -> { teams: Team[] }
 *
 * An optional `x-fan-id` header identifies the anonymous fan, which is what
 * fills in `liked` on each team. Without it every `liked` is false.
 *
 * The page calls this from the browser rather than through a server `load`,
 * so the request is visible to the network layer and can be stubbed.
 */
export const GET: RequestHandler = async ({ url, request }) => {
  const search = url.searchParams.get('search') ?? undefined
  const fanId = request.headers.get('x-fan-id') ?? undefined

  return json({ teams: await teamRepository.list(search, fanId) })
}
