import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { teamRepository } from '$lib/server/repositories/team.repository'

/**
 * PUT /api/v1/teams/[code]/like — back a team, or take it back.
 *
 * Headers: `x-fan-id: <uuid>`   the anonymous fan; there is no auth
 * Body:    { "liked": boolean } the state to set, not a toggle
 * 200 ->   { code, likes, liked }
 *
 * PUT rather than POST because the body says what the state should *become*.
 * Sending the same request twice is a no-op, so a retry cannot double-count.
 *
 * 400 when the fan id or the body is missing/malformed, 404 for a code that
 * is not one of the 48 teams. As everywhere else in this app there are no
 * test affordances — no `?fail`, no `?delay`. Fake those at the network layer.
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  const fanId = request.headers.get('x-fan-id')
  if (!fanId) error(400, 'Missing x-fan-id header')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    error(400, 'Body must be JSON')
  }

  const liked = (body as { liked?: unknown } | null)?.liked
  if (typeof liked !== 'boolean') error(400, 'Body must be { "liked": boolean }')

  const result = await teamRepository.setLike(params.code, fanId, liked)
  if (!result) error(404, `No team with code "${params.code}"`)

  return json(result)
}
