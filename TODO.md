# Backend Dependency Fix TODO

## Steps:
- [x] 1. Edit backend/package.json to fix helmet version (^7.3.2 → ^8.1.0)
- [x] 2. Clean backend/node_modules and backend/package-lock.json
- [x] 3. Run npm cache clean --force
- [x] 4. npm install (fixed helmet & swagger-jsdoc, completed successfully)
- [ ] 5. Add missing deps (morgan, compression) & npm start to verify
- [ ] 6. Update TODO.md as complete and attempt_completion

Current step: Fixing swagger-jsdoc → retry npm install.
