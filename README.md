# FIFA World Cup 2026 — Teams

A single-page SvelteKit app listing the 48 nations that qualified for the 2026
FIFA World Cup, with a live search and a "back this team" button. Built as a
**system under test** for the QAcart stubbing & mocking lessons.

## Why it is built this way

The page does **not** use a `+page.server.ts` load. It fetches from the browser
with `fetch()` on mount and again on every (debounced) keystroke, so every
search is a real HTTP request that a test can intercept, stub or mock:

```
type "bra" → 300ms debounce → GET /api/v1/teams?search=bra → cards re-render
```

That is the whole point of the app — Playwright `page.route()`, MSW, Cypress
`cy.intercept()` and friends all have something concrete to hook onto.

The heart button on each card does the same for **writes**. It updates
optimistically — the button fills in immediately, then reconciles with the
count the server returns — which is exactly why a test has to wait for the
response instead of trusting the button:

```
click ♥ → PUT /api/v1/teams/BRA/like { "liked": true } → { likes: 13 } → count settles
```

## Run it locally

You only need **Node.js 20 or newer**. There is no external database, no API key
and no account to create — the data lives in a local SQLite file that the seed
script builds for you.

```bash
git clone https://github.com/Hatamleh/fifa-26.git
cd fifa-26

npm install              # install dependencies
cp .env.example .env     # DATABASE_URL="file:./dev.db"
npm run setup            # prisma generate + db push + seed the 48 teams
npm run dev              # start the dev server
```

Then open **http://localhost:3002**. You should see 48 cards; typing in the
search box filters them.

Port 3002 is used so this can run at the same time as `qacart-todo` (3001).
Change it in `vite.config.ts` if it clashes with something else.

### Other commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload on :3002 |
| `npm run setup` | Generate the Prisma client, create `prisma/dev.db`, seed 48 teams |
| `npm run seed` | Re-run the seed only |
| `npm run reset` | Delete the SQLite file and rebuild it from scratch |
| `npm run check` | Type-check the Svelte + TypeScript sources |
| `npm run build` | Production build (adapter-node) |
| `npm start` | Serve the production build |

### If something goes wrong

- **`@prisma/client did not initialize yet`** — you skipped `npm run setup`.
  Run it, or just `npx prisma generate`.
- **Empty page / `no such table: Team`** — the database file was never created.
  Run `npm run reset`.
- **`EADDRINUSE :3002`** — something else has the port. Change it in
  `vite.config.ts`.

## API

Two endpoints. No auth, no accounts.

### Who is asking

There is no login. On first visit the browser generates a UUID, keeps it in
`localStorage` under `fifa26.fanId`, and sends it as an **`x-fan-id`** header.
That is enough for the server to keep one like per fan per team.

It is also what keeps tests isolated: every Playwright browser context starts
with an empty `localStorage`, so each test is a brand-new fan with nothing
liked. Counts are global, though — they carry over between runs. Stub the
response when you need an exact number, or `npm run reset` for a clean slate.

### `GET /api/v1/teams`

→ `200 { "teams": Team[] }` — all 48 teams, A→Z. `?search=<term>` narrows it.

Send `x-fan-id` and each team's `liked` says whether *that* fan backed it;
without the header every `liked` is `false`.

The term is matched (case-insensitively, as a substring) against the team name,
an ASCII-folded alias, the FIFA code, the continent and the confederation. So
`bra`, `BRA`, `africa`, `uefa`, `turkey` (→ Türkiye) and `curacao` (→ Curaçao)
all work. An unmatched term returns `{ "teams": [] }`, not a 404.

```jsonc
{
  "id": 13,
  "name": "Brazil",
  "slug": "brazil",          // ascii-folded, used for accent-proof search
  "code": "BRA",
  "flag": "🇧🇷",              // emoji, so there is nothing to host
  "continent": "South America",
  "confederation": "CONMEBOL",
  "isDebut": false,          // true for the four first-timers
  "titles": 5,               // World Cups won, including 2026
  "titleYears": "1958, 1962, 1970, 1994, 2002",
  "likes": 12,               // how many fans backed it, across everyone
  "liked": true              // whether *this* fan did; false without x-fan-id
}
```

### `PUT /api/v1/teams/[code]/like`

```http
PUT /api/v1/teams/BRA/like
x-fan-id: 8f3c…
content-type: application/json

{ "liked": true }
```

→ `200 { "code": "BRA", "likes": 13, "liked": true }`

**PUT, not POST, and not a toggle.** The body says what the state should
*become*, so sending the same request twice is a no-op and a retry can never
double-count. The code is case-insensitive (`bra` works).

| | |
|---|---|
| `400` | no `x-fan-id`, body is not JSON, or `liked` is not a boolean |
| `404` | `code` is not one of the 48 teams |
| `405` | any verb other than `PUT` |

## The data

Seeded from the [2026 FIFA World Cup](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup)
final team list: AFC 9, CAF 10, CONCACAF 6, CONMEBOL 6, OFC 1, UEFA 16.

- **Debutants (4):** Cape Verde, Curaçao, Jordan, Uzbekistan.
- **Former champions in the field (7):** Brazil 5, Germany 4, Argentina 3,
  Spain 2 (won 2026), Uruguay 2, France 2, England 1. Italy's four titles are
  absent because Italy did not qualify.

`prisma/seed.ts` is the single source of truth — edit it and re-run `npm run seed`.

## Test hooks

Stable `data-testid` attributes: `search-input`, `clear-search`, `result-count`,
`team-list`, `team-card` (plus `data-team="BRA"`), `team-name`, `team-flag`,
`team-continent`, `team-confederation`, `debut-tag`, `returning-tag`,
`champion-tag`, `title-years`, `empty-state`, `skeleton`, `error`, `retry`,
`like-button` (plus `data-liked` and `data-pending`), `like-count`,
`like-error`.

`data-team` sits on the card element itself, so a single team is
`[data-testid="team-card"][data-team="BRA"]` — not a `filter({ has })`.

The API itself has **no** test affordances — no `?delay`, no `?fail`. Slow
responses and failures are for the test to fake at the network layer.

### What the like button is there to teach

```ts
const bra = page.locator('[data-testid="team-card"][data-team="BRA"]')

const [request, response] = await Promise.all([
  page.waitForRequest((r) => r.url().endsWith('/teams/BRA/like') && r.method() === 'PUT'),
  page.waitForResponse((r) => r.url().endsWith('/teams/BRA/like')),
  bra.getByTestId('like-button').click(),
])

expect(request.postDataJSON()).toEqual({ liked: true })
expect(request.headers()['x-fan-id']).toBeTruthy()
expect((await response.json()).likes).toBe(13)
```

- **`waitForRequest`** has a method, a JSON body and a custom header to assert
  on — not just a URL.
- **`waitForResponse`** is the only honest way to know the count on screen came
  from the server, because the optimistic flip happens first.
- **Rollback:** `page.route('**/like', (r) => r.abort())`, click, and the button
  returns to where it was with `like-error` visible.
- **Idempotency:** click twice quickly — two requests go out, the state still
  ends up right.

## Stack

SvelteKit 5 (runes) · TypeScript · Tailwind · Prisma · SQLite · adapter-node.
Evergreen QAcart theme, shared with `qacart-todo` and qacart.com.
