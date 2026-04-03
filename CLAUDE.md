# CLAUDE.md – Støttespillet

> Dette dokumentet er kontekstfilen for AI-assistert utvikling.
> Les hele filen før du skriver en eneste linje kode.
> Følg reglene her til punkt og prikke.

---

## 1. Hva er Støttespillet?

Støttespillet er Norges første komplette sponsorplattform for idrettslag,
17. mai-komiteer og barnehager. Plattformen kobler lag med lokale bedrifter
som vil sponse – og leverer fysiske produkter og bygg med sponsor-logo.

**Eier:** UTEbygg AS (skal på sikt bli eget selskap)
**Domene:** støttespillet.no
**Repo:** github.com/utebygg/stottespillet
**Stack:** Next.js 15 · Supabase · Stripe · Claude API · Resend

### Kjerneprodukt – tre ting i ett

```
1. SPONSORMARKEDSPLASS
   Lag søker sponsor → AI finner bedrifter → bedrift godkjenner med ett klikk

2. GIVEAWAY-SHOP
   Produkter med sponsor-logo levert direkte til laget

3. SPLEIS-MODELLEN
   3–10 bedrifter finansierer noe stort sammen (badstue, gapahuk, toalettbygg osv.)
```

### Hvorfor dette eksisterer

UTEbygg selger badstuer og uterom til idrettslag. En badstue koster
kr 80 000–150 000 og de fleste lag har ikke likviditet. Støttespillet løser
finansieringsproblemet ved å la flere bedrifter gå inn som delsponsor.
Når lag kan finansiere via sponsorer øker UTEbyggs salgsvolum betydelig.

---

## 2. Brukergrupper

| Bruker | Rolle | Nøkkelverdi |
|--------|-------|-------------|
| Idrettslag / golfklubb | Søker sponsor, bestiller produkter | Slipper å selge selv |
| 17. mai-komité | Søker sponsor til medaljer, ballonger | Ingen ansatte – alt ordnes |
| Barnehage | Søker sponsor til refleksvester | Daglig synlighet for sponsor |
| Bedrift / sponsor | Mottar søknader, godkjenner, betaler | Strukturert lokalsponsing |
| UTEbygg AS (admin) | Styrer spleis, ordrer, leveranser | Mer salg av bygg og uterom |

---

## 3. Produktkatalog

### 3.1 UTEbygg-produkter (spleis-kandidater)

Disse er dyre nok til å kreve spleis og gir permanent sponsor-eksponering:

| Produkt | Salgspris | Spleis-modell | Margin |
|---------|-----------|---------------|--------|
| 🧖 Badstue (Utero Classic) | kr 80–150k | 5 × kr 20–30k | kr 20–40k |
| 🏕️ Gapahuk | kr 40–60k | 4 × kr 10–15k | kr 10–15k |
| 📦 Starterbod (hull 1 og 10) | kr 30–50k | 3 × kr 10–15k | kr 8–12k |
| ⛺ Shelter / regnly | kr 25–40k | 3 × kr 8–12k | kr 6–10k |
| 🔥 Utepeis | kr 30–50k | 3 × kr 10–15k | kr 8–12k |
| 🚻 Toalettbygg (off-grid) | kr 120–140k | 5 × kr 24–28k | kr 30–40k |

**Toalettbygg er et eget flaggskip-produkt:**
- Cinderella Freedom (propangass) – ingen strøm, ingen vann, ingen avløp
- Solcelle + batteri for smartlås, QR-system og belysning
- Vipps-betaling via QR-kode på døren (kr 10–20 per besøk)
- Smartlås åpner automatisk etter betaling
- Gir klubben passiv inntekt kr 9 000–22 500/mnd i sesong
- Ingen søknadsplikt (under 15 kvm, ingen VA-tilkobling)
- Sponsor-logo på utsiden – permanent eksponering

### 3.2 Giveaway-shop produkter

Lavterskel produkter med sponsor-logo levert direkte til laget:

| Produkt | Leverandør | Salgspris | Margin |
|---------|-----------|-----------|--------|
| ⛳ Golfballer Titleist m/logo | Promo Nordic | fra kr 690/12 stk | ~40% |
| 🕶️ Solbriller m/logo | Alibaba/Nordic | fra kr 129/stk | 60–70% |
| 🏅 17. mai medaljer m/logo | Pokalbutikk | fra kr 12/stk | 15% prov. |
| 🦺 Refleksvester m/logo | Grossist søkes | fra kr 89/stk | 40–55% |
| 👕 T-skjorter m/logo | Better WorkWear | fra kr 189/stk | 12% prov. |
| 🧢 Caps brodert m/logo | Better WorkWear | fra kr 149/stk | 12% prov. |
| 🏆 Pokaler | Pokalbutikk | fra kr 199/stk | 15% prov. |
| ☕ Refleksbeger m/logo | Grossist søkes | fra kr 45/stk | 40–50% |
| 🎈 Ballonger m/trykk | Promo Nordic | fra kr 4/stk | 60% |
| 🦺 Redningsvester barn | Maritim nabo | fra kr 299/stk | god margin |
| 🦀 Krabbeteiner (basar) | Maritim nabo | basar-premie | god margin |

### 3.3 Segmenter og nøkkelprodukter

```
GOLFKLUBBER
→ Golfballer, solbriller, gapahuk, starterbod, badstue, toalettbygg

17. MAI-KOMITEER
→ Medaljer, ballonger, godteposer, komité-skjorter, solbriller til barna

BARNEHAGER
→ Refleksvester, refleksbeger, redningsvester, barnehage-sekk

IDRETTSLAG
→ Drakter, cupreise, badstue-spleis, LED-lys, minibuss-spleis

SPEIDER / FRILUFTSLAG
→ Gapahuk, shelter, utepeis
```

---

## 4. Tech Stack

| Lag | Teknologi | Versjon |
|-----|-----------|---------|
| Frontend | Next.js App Router | 15.x |
| Styling | Tailwind CSS | 3.x |
| Komponenter | shadcn/ui | latest |
| API | tRPC | 11.x |
| Database | Supabase (PostgreSQL) | latest |
| ORM | Drizzle ORM | latest |
| Auth | Supabase Auth (magic link) | latest |
| Betaling | Stripe | latest |
| AI | Claude API – claude-sonnet-4-20250514 | latest |
| E-post | Resend + React Email | latest |
| Bedriftsdata | Brønnøysund API | v1 |
| SoMe | Meta Graph API | v20 |
| Hosting | Vercel | latest |
| QR-betaling | Vipps API | latest |
| Smartlås | Igloohome / Nuki API | latest |
| Språk | TypeScript strict | overalt |

---

## 5. Mappestruktur

```
stottespillet/
├── CLAUDE.md
├── .env.local                       ← aldri commit
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── registrer/               # velg type: lag / bedrift
│   ├── (lag)/
│   │   ├── dashboard/
│   │   ├── kampanje/
│   │   │   ├── ny/
│   │   │   └── [id]/
│   │   ├── shop/
│   │   ├── spleis/
│   │   │   ├── ny/
│   │   │   └── [id]/
│   │   └── social/
│   ├── (bedrift)/
│   │   ├── dashboard/
│   │   ├── innboks/
│   │   ├── budsjett/
│   │   └── rapporter/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── ordrer/
│   │   ├── spleis/
│   │   └── toalettbygg/             # qr + lås administrasjon
│   ├── api/
│   │   ├── trpc/
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   ├── resend/
│   │   │   └── vipps/
│   │   └── sponsor/[token]/
│   └── sponsor/[token]/
├── components/
│   ├── ui/                          # shadcn/ui
│   ├── lag/
│   ├── bedrift/
│   ├── spleis/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── claude/
│   ├── resend/
│   ├── brreg/
│   ├── meta/
│   ├── vipps/                       # toalettbygg betaling
│   ├── smartlock/                   # igloohome / nuki
│   └── utils/
├── server/
│   └── routers/
│       ├── kampanje.ts
│       ├── bedrift.ts
│       ├── shop.ts
│       ├── spleis.ts
│       ├── ai.ts
│       └── toalettbygg.ts
├── db/
│   ├── schema.ts
│   └── migrations/
└── emails/
    ├── sponsor-request.tsx
    ├── sponsor-confirmed.tsx
    └── reminder.tsx
```

---

## 6. Databasetabeller

```
organizations         – lag, komiteer, barnehager
sponsors              – bedrifter som sponser
campaigns             – sponsorsøknad per arrangement
outreach_emails       – ai-genererte e-poster med tracking
matches               – godkjent sponsorat
orders                – produktbestillinger
products              – giveaway-shop katalog
sauna_spleises        – alle spleis-typer
sauna_slots           – delsponsor-slots
social_posts          – some-innlegg
brreg_cache           – 7 dagers TTL
toilet_buildings      – toalettbygg med qr og smartlås
toilet_sessions       – betalte besøk (vipps + lås-logg)
```

**RLS-regler:**
- Lag: kun egne campaigns, orders, posts
- Bedrifter: kun egne matches og outreach_emails
- Admin: full tilgang til alt
- Toalettbygg: kun admin og eier-lag ser sessions

---

## 7. Miljøvariabler

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Claude
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=
FROM_EMAIL=post@støttespillet.no

# Meta
META_APP_ID=
META_APP_SECRET=

# Vipps (toalettbygg)
VIPPS_CLIENT_ID=
VIPPS_CLIENT_SECRET=
VIPPS_SUBSCRIPTION_KEY=
VIPPS_MERCHANT_SERIAL_NUMBER=

# Smartlås
SMARTLOCK_API_KEY=
SMARTLOCK_PROVIDER=igloohome

# App
NEXT_PUBLIC_APP_URL=https://støttespillet.no
ADMIN_SECRET_KEY=
```

---

## 8. Koderegler – følg alltid disse

### TypeScript
- Strict TypeScript overalt – ingen `any`, ingen `.js`
- Zod for all validering
- tRPC for all dataflyt – ikke løse fetch-kall
- Drizzle for all DB – aldri rå SQL

### Språk
- Brukergrensesnitt alltid på norsk
- Kode og kommentarer på engelsk
- E-poster genereres på norsk av Claude

### Sikkerhet
- RLS alltid – service role kun server-side
- Valider alle tokens (UUID)
- Sjekk Stripe og Vipps webhook-signaturer
- Aldri eksponer service keys til klient

### UI
- shadcn/ui som base
- Tailwind for all styling
- Mobil-først alltid
- Plus Jakarta Sans som font

---

## 9. Claude API

```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 800,
  messages: [{ role: "user", content: prompt }]
})
```

**Sponsor e-post regler:**
- Alltid norsk
- Maks 120 ord
- Nevn bedriftsnavn, kontaktperson og bransje
- Lokal og varm tone
- Avslutt med klikk-oppfordring og link

---

## 10. Brønnøysundregisteret

```typescript
const url = `https://data.brreg.no/enhetsregisteret/api/enheter
  ?kommunenummer=${kommuneNr}
  &naeringskode=${bransje}
  &size=20&page=0`
```

- Gratis, ingen API-nøkkel
- Cache i brreg_cache, 7 dagers TTL
- Osterøy kommunenummer = 4637

---

## 11. Stripe-flyt

```
1. Bedrift klikker "Godkjenn" i e-post
2. /sponsor/[token] viser kampanjedetaljer
3. Stripe Checkout Session opprettes
4. Betaling gjennomføres
5. Webhook → matches.status = "paid"
6. Order opprettes automatisk
7. Bekreftelse-e-post til laget
```

---

## 12. Vipps + Smartlås – toalettbygg

```
1. Bruker scanner QR på døren
2. Vipps-betaling kr 10–20
3. Vipps bekrefter via webhook
4. Igloohome/Nuki API → lås opp
5. Etter 5 min → lås igjen automatisk
6. Logges i toilet_sessions
7. Inntekt: 85% til lag, 15% til Støttespillet
```

**Off-grid oppsett:**
- Cinderella Freedom (propangass) – null strøm til toalett
- 200W solcelle → batteri → smartlås + 4G-ruter + lys
- Sponsor betaler bygget via spleis
- Laget tjener passivt på Vipps

---

## 13. Spleis-typer

```typescript
type SpleisType =
  | "badstue"
  | "gapahuk"
  | "toalettbygg"
  | "starterbod"
  | "shelter"
  | "utepeis"
  | "led_lys"
  | "storskjerm"
  | "minibuss"
  | "solcelle"
  | "kunstgress"
  | "annet"

type SpleisStatus = "draft" | "active" | "funded" | "delivered"
```

- Når `funded` → send e-post til UTEbygg AS automatisk
- Ingen betaling trekkes før alle slots er fylt
- Frist utløper → full refusjon

---

## 14. MVP-prioritering

**Bygg i rekkefølge. Test før neste steg.**

### Fase 1 – Kjerne
- [ ] Supabase Auth – magic link
- [ ] Registrering med type-valg
- [ ] Kampanje-skjema for lag
- [ ] Brønnøysund API-søk
- [ ] Claude e-postgenerering
- [ ] Resend med tracking-token
- [ ] /sponsor/[token] godkjenningsside
- [ ] Stripe betaling
- [ ] Tracking-dashboard

### Fase 2 – Shop og spleis
- [ ] Giveaway-shop
- [ ] Logo-opplastning
- [ ] Spleis-modul med alle typer
- [ ] Admin-panel for UTEbygg

### Fase 3 – Vekst
- [ ] Meta OAuth + SoMe
- [ ] Bedriftsabonnement
- [ ] Automatiske påminnelser
- [ ] Synlighetsrapporter
- [ ] Toalettbygg: Vipps + smartlås
- [ ] AI-søknadsgenerator for banker

---

## 15. Partnere

| Partner | Produkt | Status |
|---------|---------|--------|
| UTEbygg AS | Badstue, gapahuk, toalettbygg | ✅ Aktivt |
| Better WorkWear (Sotra) | T-skjorter, caps | ✅ Aktivt |
| Pokalbutikk | Medaljer, pokaler | 🔄 Forhandles |
| Maritim nabo (Osterøy) | Refleksvester, krabbeteiner | 🔄 Bank på døren |
| Promo Nordic | Golfballer, ballonger | 🔄 Innhent pris |
| Refleksvest-grossist | Refleksvester, beger | ❌ Finn snarest |

---

## 16. Testlag

| Lag | Type | Mål |
|-----|------|-----|
| Osterøy Golf & Country Club | Golfklubb | Første sponsorsøknad |
| Simulator-liga (Eriks liga) | Turnering | Første ordre |
| Lokal barnehage Osterøy | Barnehage | Refleksvest-test |

---

## 17. Cursor-prompts

**Auth:**
> "Les CLAUDE.md. Start Fase 1. Supabase Auth med magic link.
> To brukertyper: lag og bedrift. Next.js 15 App Router, shadcn/ui. Alt på norsk."

**Database:**
> "Les CLAUDE.md. Lag db/schema.ts med Drizzle for alle tabeller i
> seksjon 6. RLS på alle tabeller."

**Kampanje:**
> "Les CLAUDE.md. Bygg kampanje-skjema i app/(lag)/kampanje/ny/.
> Felter: type, tittel, beløp, dato, antall, eksponering.
> tRPC + Zod. Alt på norsk."

**AI-søk:**
> "Les CLAUDE.md. Bygg lib/brreg/search.ts med cache.
> Bygg lib/claude/generate-email.ts med norsk sponsor-e-post per bedrift."

**Spleis:**
> "Les CLAUDE.md. Bygg spleis-modul med alle spleis-typer fra seksjon 13.
> Fremgangsbar, slot-visualisering, Stripe-betaling per slot.
> Når funded: send e-post til UTEbygg automatisk."

---

## 18. Kommandoer

```bash
npm run dev
npx drizzle-kit push
npx drizzle-kit generate
stripe listen --forward-to localhost:3000/api/webhooks/stripe
npx shadcn@latest add [komponent]
npx tsc --noEmit
npm run lint
```

---

## 19. Det viktigste

```
1. Bygg enkelt – ikke overengineer
2. Én ting av gangen – test før neste
3. Lag betaler aldri – inntekt fra margin og abonnement
4. Mobil-først alltid
5. Første betalte deal > perfekt kode
6. Osterøy Golf er første testlag
7. Badstuen er kjernen – toalettbygg er det unike
8. Toalettbygg med QR + Vipps + solcelle = ingen andre har dette
```

---

*Versjon 2.0 · April 2025 · støttespillet.no · UTEbygg AS*
