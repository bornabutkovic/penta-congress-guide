# Penta — Medical Congress Travel PWA

A mobile-first, installable web app with 6 screens, premium gradient design, and Croatian copy. All data is placeholder (no backend yet).

## Design System (src/styles.css)

Define tokens in oklch + raw hex helpers:
- `--brand-orange: #F5871F`, `--brand-red: #EE4052`
- `--gradient-brand: linear-gradient(135deg, #F5871F, #EE4052)`
- `--background: #FFFFFF`, `--surface: #FAFAFA`
- `--foreground: #1E293B`, `--muted-foreground: #64748B`
- `--shadow-card: 0 2px 12px rgba(0,0,0,0.08)`
- Status colors: orange (pending), green (approved), blue (sent), red (rejected)
- Radius: 16px base, 24px for cards
- Font: Plus Jakarta Sans via Google Fonts (in `__root.tsx` head)
- Utility classes: `.bg-gradient-brand`, `.text-gradient-brand`, `.shadow-card`

## App Shell

- `src/routes/__root.tsx`: PWA meta tags, manifest link, theme-color, Apple touch icons, viewport-fit=cover. Wrap Outlet in a centered `max-w-[430px]` mobile frame with bottom nav.
- `src/components/MobileFrame.tsx`: white phone-shaped container centered on desktop, full-bleed on mobile.
- `src/components/BottomNav.tsx`: Home / Voice / Chat / Ponude — active item icon + label use gradient.
- Page transitions: framer-motion fade/slide on route change.

## Routes (TanStack file-based)

```
src/routes/
  __root.tsx          shell + nav + PWA meta
  index.tsx           Login / Splash
  home.tsx            Dashboard
  voice.tsx           Voice agent (animated orb)
  chat.tsx            Chat
  ponude.tsx          My quotes list
  ponude.$id.tsx      Quote detail
```

Each route gets its own `head()` with Croatian title + description.

## Screens

1. **Splash/Login** (`/`): Penta logo centered, "Vaš kongresni asistent" tagline, email + password inputs, gradient "Prijava" button. Soft warm gradient background. Submit navigates to `/home` (no auth logic yet).

2. **Home** (`/home`): "Dobrodošli, Marko!" greeting, 3 gradient-icon action cards (Plane / Mic / List) linking to voice, chat, ponude. Recent quotes list (3 placeholder items) with status badges + EUR price.

3. **Voice** (`/voice`): Centered animated orb (CSS radial gradient + pulse/ripple keyframes), state toggle (idle/listening/speaking) via local state with a demo button. Live transcript placeholder. Red end-call + mute buttons. "ili pišite" link → `/chat`.

4. **Chat** (`/chat`): Scrollable message list with gradient user bubbles (right) and gray agent bubbles with Penta avatar (left). Quick reply pills with gradient border above input. Input bar with gradient mic icon. Local state echoes a canned reply.

5. **My Quotes** (`/ponude`): Filter tabs (Sve/Na čekanju/Odobreno/Poslano) with gradient underline on active. List rows: congress name, city, dates, status badge, EUR. Tap → detail.

6. **Quote Detail** (`/ponude/$id`): Header with gradient accent + congress info. Accordion sections: Let, Smještaj, Transfer, Kotizacija. Large gradient total price. Status timeline (Kreirano → Na pregledu → Odobreno → Poslano) with gradient-filled completed steps.

## Placeholder Data

`src/lib/mock-data.ts`: ~6 quotes with congress name, city, dates (e.g. ESC Congress Amsterdam, EASD Vienna), status, price, flight/hotel/transfer/fee breakdown.

## Assets

- Copy uploaded Penta logo → `src/assets/penta-logo.png`
- Generate a white version of the logo for dark backgrounds via image edit
- Generate a 512×512 PWA icon (maskable) and 192×192 icon under `public/icons/`

## PWA Installability (manifest-only)

Per platform guidance, going manifest-only is safer than a full service worker (which breaks the Lovable preview). This still enables "Add to Home Screen" on iOS and Android — just no offline support.

- `public/manifest.webmanifest`: name "Penta", short_name "Penta", `display: "standalone"`, `start_url: "/"`, theme_color `#F5871F`, background_color `#FFFFFF`, icons 192/512 + maskable.
- `__root.tsx` head: `<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-title" content="Penta">`.
- No service worker, no `vite-plugin-pwa`.

> Note: full offline-PWA with a service worker would interfere with the Lovable preview iframe and serve stale content. Manifest-only gives you installability + standalone display without those problems. If you later want offline support, we can add a guarded service worker that only activates in production.

## Dependencies to add

- `framer-motion` (page transitions, orb animation)
- `lucide-react` (already typically present — icons)

## Out of scope (this pass)

- Real authentication / Lovable Cloud
- Real voice agent (ElevenLabs) — orb is visual-only with state toggle
- Persisting quotes — all data is mock
- Full offline service worker

Confirm and I'll build it.
