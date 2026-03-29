# ServeUp — Project Status

## Current State
MVP v2 Complete — money-first rebuild based on CEO feedback.

## Sprint Period
2026-03-29 (single-sprint POC)

## Architecture Change
Shifted from dashboard-first to money-first flow. Onboarding now forces service/price/availability setup before anything else. Dashboard shows only real data.

## Completed
- 4-step onboarding: You → Service → Hours → Go Live
- Live booking preview (split-screen, updates in real-time during onboarding)
- Public booking page at `/book/:slug` with interactive Book button
- Booking modal: client name, date picker (availability-aware), time
- Dashboard: empty state when no bookings, real stats when bookings exist
- Storefront editor with side-by-side live preview
- Service CRUD (add/edit/delete)
- Settings: availability editor, platform fee display, merchant fee placeholder
- Dark theme with amber accent (identity shift from generic SaaS)
- Booking link banner with Copy/View on dashboard
- Sidebar with "View Booking Page" shortcut

## Stack
React 19 + Vite 8 + Tailwind CSS 4 + React Router 7

## Fee Model
- Platform fee: $0.50 flat per transaction (hardcoded, shown in settings)
- Merchant fee settings: placeholder UI (Coming Soon)

## Key Files
- `src/context/MerchantContext.jsx` — shared state (services, bookings, availability, slug)
- `src/pages/Onboarding.jsx` — 4-step wizard with live preview
- `src/pages/BookingPage.jsx` — public client-facing booking
- `src/pages/Dashboard.jsx` — real-data-only dashboard
- `src/pages/Storefront.jsx` — editor with live preview
- `src/pages/Services.jsx` — service CRUD
- `src/pages/Settings.jsx` — availability, fees, account
- `src/components/BookingPreview.jsx` — reusable booking card
- `src/components/Layout.jsx` — dark sidebar layout

## Bugs
- None identified

## Next Actions
- Backend integration (auth, persistence, real booking storage)
- SMS/email booking confirmations
- Photo upload for storefront (works locally, needs cloud storage)
- Multiple services during onboarding
- Calendar view for bookings
- Mobile-responsive optimization
- Payment processing integration
