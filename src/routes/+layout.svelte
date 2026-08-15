<script lang="ts">
  import '../app.css'
  import QacartMark from '$lib/components/QacartMark.svelte'

  let { children }: { children: any } = $props()
</script>

<div class="flex min-h-screen flex-col bg-background bg-grid-fade">
  <header class="border-b border-border">
    <nav
      aria-label="Main"
      class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4"
    >
      <a
        href="/"
        aria-label="World Cup 2026 home"
        data-testid="brand"
        class="flex items-center text-foreground transition-colors hover:text-primary"
      >
        <span class="w-9 shrink-0"><QacartMark /></span>
      </a>

      <span class="font-mono text-xs uppercase tracking-widest text-subtle">
        Canada · Mexico · USA
      </span>
    </nav>
  </header>

  <main class="flex-1 px-6 py-10">
    {@render children()}
  </main>
</div>
