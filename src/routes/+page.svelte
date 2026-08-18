<script lang="ts">
  import { onMount } from 'svelte'
  import { Search, X } from 'lucide-svelte'
  import TeamCard from '$lib/components/TeamCard.svelte'
  import { fanId } from '$lib/fan'
  import type { Team, TeamsResponse } from '$lib/types'

  let teams = $state<Team[]>([])
  let query = $state('')
  let loading = $state(true)
  let error = $state<string | null>(null)
  /** False until the very first response lands, so the skeleton only shows once. */
  let hasLoaded = $state(false)

  let debounce: ReturnType<typeof setTimeout> | undefined
  /**
   * Typing fast fires several overlapping requests and they can come back out
   * of order. Only the newest one is allowed to write to `teams`.
   */
  let latestRequest = 0

  async function load(term: string) {
    const request = ++latestRequest
    loading = true
    error = null

    const url = term.trim() ? `/api/v1/teams?search=${encodeURIComponent(term.trim())}` : '/api/v1/teams'

    try {
      // The fan id comes along so the server can say which teams this browser
      // has already backed; without it every card would come back unliked.
      const response = await fetch(url, { headers: { 'x-fan-id': fanId() } })
      if (!response.ok) throw new Error(`Request failed with ${response.status}`)

      const data: TeamsResponse = await response.json()
      if (request !== latestRequest) return // a newer search already answered
      teams = data.teams
    } catch (e) {
      if (request !== latestRequest) return
      error = e instanceof Error ? e.message : 'Something went wrong'
      teams = []
    } finally {
      if (request === latestRequest) {
        loading = false
        hasLoaded = true
      }
    }
  }

  // Search runs on its own as the user types — there is no submit button.
  function onInput() {
    clearTimeout(debounce)
    debounce = setTimeout(() => load(query), 300)
  }

  function clearSearch() {
    query = ''
    clearTimeout(debounce)
    load('')
  }

  onMount(() => {
    load('')
    return () => clearTimeout(debounce)
  })
</script>

<svelte:head>
  <title>FIFA World Cup 2026 — Qualified Teams</title>
  <meta name="description" content="The 48 teams that qualified for the 2026 FIFA World Cup." />
</svelte:head>

<div class="mx-auto w-full max-w-6xl">
  <div class="text-center">
    <p class="eyebrow">Canada · Mexico · USA</p>
    <h1 class="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
      World Cup <span class="grad">2026</span> teams
    </h1>
    <p class="mx-auto mt-3 max-w-xl text-muted-foreground">
      All 48 qualified nations. Search by country, continent or confederation.
    </p>
  </div>

  <div class="relative mx-auto mt-8 max-w-xl">
    <Search
      size={18}
      aria-hidden="true"
      class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
    />
    <input
      type="search"
      bind:value={query}
      oninput={onInput}
      data-testid="search-input"
      aria-label="Search teams"
      placeholder="Try “brazil”, “africa” or “uefa”…"
      autocomplete="off"
      class="field !pl-11 !pr-11"
    />
    {#if query}
      <button
        type="button"
        onclick={clearSearch}
        data-testid="clear-search"
        aria-label="Clear search"
        class="absolute right-3 top-1/2 -translate-y-1/2 rounded-pill p-1.5 text-subtle transition-colors hover:bg-ever-card hover:text-foreground"
      >
        <X size={16} />
      </button>
    {/if}
  </div>

  <p
    data-testid="result-count"
    aria-live="polite"
    class="mt-4 text-center font-mono text-xs uppercase tracking-widest text-subtle"
  >
    {#if loading && !hasLoaded}
      Loading teams…
    {:else if loading}
      Searching…
    {:else if error}
      —
    {:else}
      {teams.length} {teams.length === 1 ? 'team' : 'teams'}
    {/if}
  </p>

  {#if error}
    <div data-testid="error" role="alert" class="surface mx-auto mt-8 max-w-md p-6 text-center">
      <p class="text-destructive">Could not load the teams.</p>
      <p class="mt-1 text-sm text-muted-foreground">{error}</p>
      <button type="button" onclick={() => load(query)} data-testid="retry" class="btn mt-4">
        Try again
      </button>
    </div>
  {:else if loading && !hasLoaded}
    <ul data-testid="skeleton" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each Array(6) as _, i (i)}
        <li class="surface h-[9.5rem] animate-pulse opacity-50"></li>
      {/each}
    </ul>
  {:else if teams.length === 0}
    <div data-testid="empty-state" class="surface mx-auto mt-8 max-w-md p-8 text-center">
      <p class="text-foreground">No team matches “{query}”.</p>
      <p class="mt-1 text-sm text-muted-foreground">Check the spelling, or clear the search.</p>
      <button type="button" onclick={clearSearch} class="btn mt-4">Clear search</button>
    </div>
  {:else}
    <ul
      data-testid="team-list"
      class="mt-8 grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 {loading
        ? 'opacity-60'
        : 'opacity-100'}"
    >
      {#each teams as team (team.id)}
        <TeamCard {team} />
      {/each}
    </ul>
  {/if}
</div>
