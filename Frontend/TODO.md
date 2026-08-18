# Complete User Panel - Expanded Features Plan

## Information Gathered
- Components exist: Sidebar.jsx, DesignCard.jsx, EngineerCard.jsx, FiltersSidebar.jsx, BookingModal.jsx
- Services exist: design/engineer/booking/user/notification
- Pages exist: Dashboard, Designs, DesignDetails, Engineers, Bookings, Profile, Notifications
- Missing: FieldMapping, MaterialMarketplace, 3D viz (placeholder), smart booking availability
- Backend endpoints assumed: /fields (save field), /materials, /availability

## Plan
### Phase 2.1: Core Missing Pages
1. **Field Mapping (/user/field-mapping)**: Leaflet map + draw/save field → POST /fields
2. **Materials (/user/materials)**: Grid/cart/checkout → new materialService.js
3. **UserLayout.jsx**: Navbar + Sidebar

### Phase 2.2: Enhancements
1. **Designs**: Filter by user field size (integrate field context)
2. **DesignDetails**: 3D placeholder (canvas/3D rotate img)
3. **Booking**: Availability check (mock dates from engineer)
4. **Sidebar**: Update nav links

### Dependent Files
- New: src/pages/User/FieldMapping.jsx, src/services/materialService.js, src/services/fieldService.js?
- Update: App.jsx (routes), UserLayout.jsx (sidebar), Sidebar.jsx (nav)

### Followup Steps
1. `cd Frontend && npm i leaflet react-leaflet` (map)
2. `npm run dev` test each feature
3. Full flow: Dashboard → Field → Designs → Details → Book → Bookings

<ask_followup_question>Approve plan? Prioritize Field Mapping first?</ask_followup_question>
