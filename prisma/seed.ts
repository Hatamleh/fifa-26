import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * The 48 teams that qualified for the 2026 FIFA World Cup, by confederation:
 * AFC 9, CAF 10, CONCACAF 6, CONMEBOL 6, OFC 1, UEFA 16.
 *
 * `continent` is geographic, not political, so Australia sits in Oceania even
 * though it plays in the AFC — the card shows the continent, the confederation
 * is the smaller label next to it.
 *
 * `titles` counts World Cups won including 2026, which Spain won 1-0 against
 * Argentina. Italy (4 titles) is absent because it did not qualify.
 * Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup
 */
type Seed = {
  name: string
  slug: string
  code: string
  flag: string
  continent: string
  confederation: string
  isDebut?: boolean
  titles?: number
  titleYears?: string
}

const teams: Seed[] = [
  // ── AFC (9) ────────────────────────────────────────────────────────────
  { name: 'Australia', slug: 'australia', code: 'AUS', flag: '🇦🇺', continent: 'Oceania', confederation: 'AFC' },
  { name: 'Iran', slug: 'iran', code: 'IRN', flag: '🇮🇷', continent: 'Asia', confederation: 'AFC' },
  { name: 'Iraq', slug: 'iraq', code: 'IRQ', flag: '🇮🇶', continent: 'Asia', confederation: 'AFC' },
  { name: 'Japan', slug: 'japan', code: 'JPN', flag: '🇯🇵', continent: 'Asia', confederation: 'AFC' },
  { name: 'Jordan', slug: 'jordan', code: 'JOR', flag: '🇯🇴', continent: 'Asia', confederation: 'AFC', isDebut: true },
  { name: 'Qatar', slug: 'qatar', code: 'QAT', flag: '🇶🇦', continent: 'Asia', confederation: 'AFC' },
  { name: 'Saudi Arabia', slug: 'saudi arabia', code: 'KSA', flag: '🇸🇦', continent: 'Asia', confederation: 'AFC' },
  { name: 'South Korea', slug: 'south korea', code: 'KOR', flag: '🇰🇷', continent: 'Asia', confederation: 'AFC' },
  { name: 'Uzbekistan', slug: 'uzbekistan', code: 'UZB', flag: '🇺🇿', continent: 'Asia', confederation: 'AFC', isDebut: true },

  // ── CAF (10) ───────────────────────────────────────────────────────────
  { name: 'Algeria', slug: 'algeria', code: 'ALG', flag: '🇩🇿', continent: 'Africa', confederation: 'CAF' },
  { name: 'Cape Verde', slug: 'cape verde', code: 'CPV', flag: '🇨🇻', continent: 'Africa', confederation: 'CAF', isDebut: true },
  { name: 'DR Congo', slug: 'dr congo', code: 'COD', flag: '🇨🇩', continent: 'Africa', confederation: 'CAF' },
  { name: 'Egypt', slug: 'egypt', code: 'EGY', flag: '🇪🇬', continent: 'Africa', confederation: 'CAF' },
  { name: 'Ghana', slug: 'ghana', code: 'GHA', flag: '🇬🇭', continent: 'Africa', confederation: 'CAF' },
  { name: "Côte d'Ivoire", slug: "cote d'ivoire ivory coast", code: 'CIV', flag: '🇨🇮', continent: 'Africa', confederation: 'CAF' },
  { name: 'Morocco', slug: 'morocco', code: 'MAR', flag: '🇲🇦', continent: 'Africa', confederation: 'CAF' },
  { name: 'Senegal', slug: 'senegal', code: 'SEN', flag: '🇸🇳', continent: 'Africa', confederation: 'CAF' },
  { name: 'South Africa', slug: 'south africa', code: 'RSA', flag: '🇿🇦', continent: 'Africa', confederation: 'CAF' },
  { name: 'Tunisia', slug: 'tunisia', code: 'TUN', flag: '🇹🇳', continent: 'Africa', confederation: 'CAF' },

  // ── CONCACAF (6) ───────────────────────────────────────────────────────
  { name: 'Canada', slug: 'canada', code: 'CAN', flag: '🇨🇦', continent: 'North America', confederation: 'CONCACAF' },
  { name: 'Curaçao', slug: 'curacao', code: 'CUW', flag: '🇨🇼', continent: 'North America', confederation: 'CONCACAF', isDebut: true },
  { name: 'Haiti', slug: 'haiti', code: 'HAI', flag: '🇭🇹', continent: 'North America', confederation: 'CONCACAF' },
  { name: 'Mexico', slug: 'mexico', code: 'MEX', flag: '🇲🇽', continent: 'North America', confederation: 'CONCACAF' },
  { name: 'Panama', slug: 'panama', code: 'PAN', flag: '🇵🇦', continent: 'North America', confederation: 'CONCACAF' },
  { name: 'United States', slug: 'united states usa', code: 'USA', flag: '🇺🇸', continent: 'North America', confederation: 'CONCACAF' },

  // ── CONMEBOL (6) ───────────────────────────────────────────────────────
  { name: 'Argentina', slug: 'argentina', code: 'ARG', flag: '🇦🇷', continent: 'South America', confederation: 'CONMEBOL', titles: 3, titleYears: '1978, 1986, 2022' },
  { name: 'Brazil', slug: 'brazil', code: 'BRA', flag: '🇧🇷', continent: 'South America', confederation: 'CONMEBOL', titles: 5, titleYears: '1958, 1962, 1970, 1994, 2002' },
  { name: 'Colombia', slug: 'colombia', code: 'COL', flag: '🇨🇴', continent: 'South America', confederation: 'CONMEBOL' },
  { name: 'Ecuador', slug: 'ecuador', code: 'ECU', flag: '🇪🇨', continent: 'South America', confederation: 'CONMEBOL' },
  { name: 'Paraguay', slug: 'paraguay', code: 'PAR', flag: '🇵🇾', continent: 'South America', confederation: 'CONMEBOL' },
  { name: 'Uruguay', slug: 'uruguay', code: 'URU', flag: '🇺🇾', continent: 'South America', confederation: 'CONMEBOL', titles: 2, titleYears: '1930, 1950' },

  // ── OFC (1) ────────────────────────────────────────────────────────────
  { name: 'New Zealand', slug: 'new zealand', code: 'NZL', flag: '🇳🇿', continent: 'Oceania', confederation: 'OFC' },

  // ── UEFA (16) ──────────────────────────────────────────────────────────
  { name: 'Austria', slug: 'austria', code: 'AUT', flag: '🇦🇹', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Belgium', slug: 'belgium', code: 'BEL', flag: '🇧🇪', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Bosnia and Herzegovina', slug: 'bosnia and herzegovina', code: 'BIH', flag: '🇧🇦', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Croatia', slug: 'croatia', code: 'CRO', flag: '🇭🇷', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Czechia', slug: 'czechia czech republic', code: 'CZE', flag: '🇨🇿', continent: 'Europe', confederation: 'UEFA' },
  { name: 'England', slug: 'england', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', continent: 'Europe', confederation: 'UEFA', titles: 1, titleYears: '1966' },
  { name: 'France', slug: 'france', code: 'FRA', flag: '🇫🇷', continent: 'Europe', confederation: 'UEFA', titles: 2, titleYears: '1998, 2018' },
  { name: 'Germany', slug: 'germany', code: 'GER', flag: '🇩🇪', continent: 'Europe', confederation: 'UEFA', titles: 4, titleYears: '1954, 1974, 1990, 2014' },
  { name: 'Netherlands', slug: 'netherlands', code: 'NED', flag: '🇳🇱', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Norway', slug: 'norway', code: 'NOR', flag: '🇳🇴', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Portugal', slug: 'portugal', code: 'POR', flag: '🇵🇹', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Scotland', slug: 'scotland', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Spain', slug: 'spain', code: 'ESP', flag: '🇪🇸', continent: 'Europe', confederation: 'UEFA', titles: 2, titleYears: '2010, 2026' },
  { name: 'Sweden', slug: 'sweden', code: 'SWE', flag: '🇸🇪', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Switzerland', slug: 'switzerland', code: 'SUI', flag: '🇨🇭', continent: 'Europe', confederation: 'UEFA' },
  { name: 'Türkiye', slug: 'turkiye turkey', code: 'TUR', flag: '🇹🇷', continent: 'Europe', confederation: 'UEFA' },
]

async function main() {
  // The seed is the single source of truth for this table, so it is rebuilt
  // from scratch on every run rather than upserted.
  await prisma.team.deleteMany()

  for (const team of teams) {
    await prisma.team.create({
      data: {
        ...team,
        isDebut: team.isDebut ?? false,
        titles: team.titles ?? 0,
        titleYears: team.titleYears ?? '',
      },
    })
  }

  console.log(`Seeded ${teams.length} teams.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
