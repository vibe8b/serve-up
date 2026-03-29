# Sprint

## Sprint Goal
Build ServeUp MVP — merchant-facing service marketplace with onboarding, storefront builder, service listing, dashboard, and settings.

## Sprint Time
2026-03-29 (single-sprint POC)

## Priorities

### P0
- [Pod 1] Onboarding flow (name, business, category)
- [Pod 1] Storefront builder (photo, bio, location, hours)
- [Pod 1] Service listing CRUD (name, duration, price)
- [Pod 1] Dashboard with mock bookings + earnings
- [Pod 1] Settings with fee config placeholder

### P1
- [Pod 1] Platform fee model ($0.50 flat per transaction)
- [Pod 1] Sidebar navigation + layout shell

### P2
- None

## Pod Allocation

### Pod 1 – Core App
- Scaffold React + Vite + Tailwind project
- Build MerchantContext for shared local state
- Build 3-step onboarding (name → business → category)
- Build storefront builder (photo upload, bio, location, hours)
- Build service listing with add/edit/delete
- Build dashboard with stat cards + mock booking list
- Build settings with account info, platform fee display, merchant fee placeholder
- Wire React Router with sidebar layout

## Bug Fixes
- None

## QA Focus
- Onboarding flow completion
- Service CRUD operations
- Dashboard stats accuracy ($0.50 × booking count)
- Navigation between all screens

## Product Testing Scenarios
- New merchant completes onboarding end-to-end
- Merchant adds, edits, and deletes services
- Dashboard reflects correct fee calculations
- Settings reset returns to onboarding

## Deliverables
- Fully functional 5-screen merchant MVP
- Local state management (no backend)
- Desktop-first, mobile-responsive layout

## Status
- Complete
