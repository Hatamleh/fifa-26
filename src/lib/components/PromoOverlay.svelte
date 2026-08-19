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
       it. An overlay that does not intercept the click teaches nothing.
       Opaque, not translucent — a card showing faintly through the ad reads
       as a rendering bug rather than a takeover. -->
  <div
    data-testid="promo-overlay"
    class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-card border border-oranje/30 bg-ever-bg px-5 text-center"
  >
    <!-- A warm bloom behind the copy. The rest of the app is pine green, so
         the orange instantly reads as "this is an ad, not part of the app". -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-oranje/25 blur-3xl"
    ></div>

    <button
      type="button"
      onclick={close}
      data-testid="promo-close"
      aria-label="Close the offer"
      class="absolute right-2.5 top-2.5 z-10 rounded-pill p-1.5 text-subtle transition-colors hover:bg-ever-card hover:text-foreground"
    >
      <X size={15} />
    </button>

    <span
      class="relative rounded-pill border border-oranje/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-oranje"
    >
      Sponsored
    </span>

    <p class="relative font-display text-xl font-bold leading-tight text-foreground">
      Oranje fan shop
    </p>
    <p class="relative text-sm leading-snug text-muted-foreground">
      20% off every {teamName} shirt this week.
    </p>

    <button
      type="button"
      class="relative mt-1.5 rounded-pill bg-oranje px-4 py-1.5 text-sm font-semibold text-ever-ink transition-colors hover:bg-oranje-hover"
    >
      Shop now
    </button>
  </div>
{/if}
