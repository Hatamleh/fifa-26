/**
 * The app has no accounts. A "fan" is a UUID this browser makes up the first
 * time it needs one and keeps in localStorage, sent as the `x-fan-id` header.
 * That is enough for the server to keep one like per fan per team.
 *
 * It also keeps tests honest: every Playwright browser context starts with an
 * empty localStorage, so each test is a brand-new fan with nothing liked.
 */
const KEY = 'fifa26.fanId'

/** Browser only — calling this during SSR throws. */
export function fanId(): string {
  const stored = localStorage.getItem(KEY)
  if (stored) return stored

  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `fan-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`

  localStorage.setItem(KEY, created)
  return created
}
