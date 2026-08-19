<script lang="ts">
  import { onMount } from 'svelte'
  import { X } from 'lucide-svelte'

  let { teamName }: { teamName: string } = $props()

  /**
   * Whether this visitor gets the ad at all is a coin flip, and it lands a
   * moment after the card appears rather than with it.
   *
   * Random *timing* alone does not work here: a test clicks about a second
   * in, so an ad on a two-to-six second timer never actually collides with
   * anything and the unhandled test passes every single run. Random
   * *occurrence* is what makes it honestly flaky — roughly half the runs get
   * interrupted, which is the whole demonstration.
   *
   * The short delay matters too. Appearing on mount would make "dismiss it at
   * the start of the test" a working fix; arriving a beat later means the ad
   * is still ahead of you when you have already looked for it, and
   * addLocatorHandler is the only thing that copes.
   */
  const SHOWS_THIS_VISIT = Math.random() < 0.55

  let visible = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  const between = (min: number, max: number) => min + Math.random() * (max - min)

  function arm(min: number, max: number) {
    clearTimeout(timer)
    timer = setTimeout(() => (visible = true), between(min, max))
  }

  function close() {
    visible = false
    arm(15_000, 25_000) // it comes back, the way real ones do
  }

  onMount(() => {
    if (SHOWS_THIS_VISIT) arm(120, 380)
    return () => clearTimeout(timer)
  })
</script>

{#if visible}
  <!-- inset-0 on purpose: it has to cover the like button, not sit next to
       it. An overlay that does not intercept the click teaches nothing. -->
  <div
    data-testid="promo-overlay"
    class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-card bg-ever-card/95 p-5 text-center backdrop-blur-sm"
  >
    <button
      type="button"
      onclick={close}
      data-testid="promo-close"
      aria-label="Close the offer"
      class="absolute right-3 top-3 rounded-pill p-1.5 text-subtle transition-colors hover:bg-ever-surface hover:text-foreground"
    >
      <X size={16} />
    </button>

    <p class="font-mono text-[10px] uppercase tracking-widest text-subtle">Sponsored</p>
    <p class="font-display text-lg font-semibold text-foreground">Oranje fan shop</p>
    <p class="text-sm text-muted-foreground">20% off every {teamName} shirt this week.</p>
    <button type="button" class="btn mt-1">Shop now</button>
  </div>
{/if}
