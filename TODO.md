# PLANOVA — Engineer Panel Completion & Regression Fix

## Phase 1: User Panel Runtime Crash Fixes
- [x] Investigate /auth/login 401 → root cause: credential mismatch, not code bug (repro returns 200 for provisioned users)
- [x] Investigate /dashboard → root cause: frontend runtime crashes (missing imports), backend returns 200 for empty data
- [x] Fix `Bookings.jsx` — import `notificationService` (missing → ReferenceError)
- [x] Fix `FieldMapping.jsx` — import `fieldService` (missing) + `MapPin` icon (missing)
- [x] Fix `DesignDetails.jsx` — import `Link` (missing) + fix undefined `engineer` reference
- [x] Fix `MapField.jsx` — `calculateArea` used before declaration (hoisting ReferenceError)
- [x] Add `socket.io-client` dependency (required by ChatList, ChatWindow, Notifications)
- [x] Create shared socket utility to avoid 3 duplicate implementations
- [x] Fix `ChatWindow.jsx` — do not disconnect shared socket on unmount
- [x] Fix `ErrorBoundary.jsx` — use `import.meta.env.DEV` instead of `process.env.NODE_ENV`
- [x] Fix `ReviewModal.jsx` — add `onSuccess` prop + null-guard `engineer.name`

## Phase 2: Test/E2E Account Provisioning
- [x] Create development/test-only seed script with production guard (`backend/scripts/seed-dev.js`)
- [x] Provision E2E User + E2E Engineer accounts (real bcrypt hashes, no bypass)
- [x] Create E2E verification script (`backend/scripts/verify-e2e.js`) — ALL CHECKS PASSED

## Phase 3: User Panel Regression
- [x] Verify Login (user + engineer) — 200
- [x] Verify Dashboard (`GET /api/v1/dashboard`) — 200 with zero stats
- [x] Verify invalid password → 401, unknown user → 401
- [x] Verify `/auth/me` returns correct role
- [ ] Verify Bookings page (runtime)
- [ ] Verify FieldMapping page (runtime)
- [ ] Verify DesignDetails page (runtime)
- [ ] Verify ChatList/ChatWindow/Notifications pages (runtime)
- [ ] Verify Profile/Projects/Engineer Discovery/Documents/Settings/Logout (runtime)

## Phase 4: Engineer Panel Completeness
- [ ] Audit EngineerDashboard (no fake data)
- [ ] Audit Profile (edit/save/refresh persistence)
- [ ] Audit Verification workflow
- [ ] Audit Availability (persistence)
- [ ] Audit Blueprints (CRUD against real backend)
- [ ] Audit BookingRequests/Consultations
- [ ] Audit Projects/ProjectDetail
- [ ] Audit Messages/Notifications/Reviews/Analytics
- [ ] Audit Sidebar + Routing (no dead links)

## Phase 5: Security & API Contract Audit
- [x] Audit auth/role/ownership/IDOR on engineer endpoints
- [x] Fix IDOR in `GET /bookings/:id` — added ownership check (owner/engineer/admin) in booking controller + service
- [x] Verify Blueprint update/delete/submit enforce `engineerId` ownership (no cross-engineer access)
- [x] Verify Project routes enforce `canAccessProject` (owner/engineer/member/admin) — IDOR protected
- [x] Audit frontend/backend API contracts (URL/method/body/response) — matches for engineer dashboard/service

## Phase 6: Final Test & Audit
- [x] Frontend production build PASS (vite build, 2535 modules)
- [x] Backend auth/dashboard E2E PASS
- [x] Backend unit tests PASS (63/63)
- [x] Engineer dashboard E2E PASS (real data, all zeros for fresh engineer)
- [ ] E2E workflow test
- [ ] Update `docs/engineer-panel-audit.md`
- [ ] Create `docs/engineer-panel/` with verified results
