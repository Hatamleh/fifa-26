<script lang="ts">
  import { Sparkles, Trophy } from 'lucide-svelte'
  import type { Team } from '$lib/types'

  let { team }: { team: Team } = $props()

  let isChampion = $derived(team.titles > 0)
</script>

<li
  data-testid="team-card"
  data-team={team.code}
  class="surface surface-interactive flex flex-col gap-4 p-5"
>
  <div class="flex items-start gap-4">
    <!-- The emoji is decoration; the name next to it already says which team
         this is, so it is hidden from the accessibility tree. -->
    <span data-testid="team-flag" aria-hidden="true" class="text-4xl leading-none">{team.flag}</span>

    <div class="min-w-0 flex-1">
      <h2 data-testid="team-name" class="truncate text-lg font-semibold text-foreground">
        {team.name}
      </h2>
      <p class="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
        <span data-testid="team-continent">{team.continent}</span>
        <span aria-hidden="true" class="text-subtle">•</span>
        <span data-testid="team-confederation" class="font-mono text-xs text-subtle">
          {team.confederation}
        </span>
      </p>
    </div>

    <span class="font-mono text-xs text-subtle">{team.code}</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    {#if team.isDebut}
      <span data-testid="debut-tag" class="tag border-accent-purple/40 text-accent-purple">
        <Sparkles size={12} class="mr-1.5" />
        First time
      </span>
    {:else}
      <span data-testid="returning-tag" class="tag">Returning</span>
    {/if}

    {#if isChampion}
      <span data-testid="champion-tag" class="tag border-sand/40 text-sand">
        <Trophy size={12} class="mr-1.5" />
        {team.titles}× champion
      </span>
    {/if}
  </div>

  {#if isChampion}
    <p data-testid="title-years" class="font-mono text-xs text-subtle">
      Won in {team.titleYears}
    </p>
  {/if}
</li>
