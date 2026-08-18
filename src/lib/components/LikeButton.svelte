<script lang="ts">
  import { untrack } from 'svelte'
  import { Heart } from 'lucide-svelte'
  import { fanId } from '$lib/fan'
  import type { LikeResponse, Team } from '$lib/types'

  let { team }: { team: Team } = $props()

  // `untrack` only because the $effect below owns the syncing — reading the
  // prop here is a one-off seed, not a subscription.
  let liked = $state(untrack(() => team.liked))
  let likes = $state(untrack(() => team.likes))
  let pending = $state(false)
  let failed = $state(false)

  // A fresh payload for this same card (a re-search, a retry) wins over what
  // is on screen. It only re-runs when the server numbers actually change, so
  // it never stomps on an optimistic update.
  $effect(() => {
    liked = team.liked
    likes = team.likes
  })

  /** Clicking faster than the network answers: only the newest reply counts. */
  let latestRequest = 0

  async function toggle() {
    const request = ++latestRequest
    const next = !liked
    const previous = { liked, likes }

    // Optimistic: the button flips now and reconciles with the server count
    // when the response lands. This is why a test has to wait for the
    // response rather than trust the button.
    liked = next
    likes = next ? likes + 1 : Math.max(0, likes - 1)
    pending = true
    failed = false

    try {
      const response = await fetch(`/api/v1/teams/${team.code}/like`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', 'x-fan-id': fanId() },
        body: JSON.stringify({ liked: next }),
      })
      if (!response.ok) throw new Error(`Request failed with ${response.status}`)

      const data: LikeResponse = await response.json()
      if (request !== latestRequest) return

      liked = data.liked
      likes = data.likes
    } catch {
      if (request !== latestRequest) return
      // Put the button back where it was — the like never happened.
      liked = previous.liked
      likes = previous.likes
      failed = true
    } finally {
      if (request === latestRequest) pending = false
    }
  }
</script>

<div class="flex items-center gap-2">
  <button
    type="button"
    onclick={toggle}
    data-testid="like-button"
    data-liked={liked}
    data-pending={pending}
    aria-pressed={liked}
    aria-label={liked ? `Stop backing ${team.name}` : `Back ${team.name}`}
    class="tag transition-colors hover:border-border-hover {liked
      ? 'border-destructive/40 text-destructive'
      : 'text-muted-foreground'}"
  >
    <Heart size={12} fill={liked ? 'currentColor' : 'none'} class="mr-1.5" />
    <span data-testid="like-count" class="font-mono">{likes}</span>
  </button>

  {#if failed}
    <span data-testid="like-error" role="status" class="text-xs text-destructive">
      Could not save
    </span>
  {/if}
</div>
