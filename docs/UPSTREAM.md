# Upstream audit and integration status

- Candidate: https://github.com/Avatarchik/opensa
- Exact audited head: `d30f4e8ad2d41a9c7965c1416d7e857b5ef5f7e6` (2026-06-25).
- Original author: Aleksandrov Sergey, copyright (c) 2026.
- Original repository: https://github.com/AlexSergey/opensa
- OpenSA license: AGPL-3.0-only; see the upstream LICENSE included at repository root.
- Stack: TypeScript, React, Vite, three.js, Rapier; Nx + npm workspaces.
- Original-game entry in `apps/web/src/game-config.tsx` has `assetLoader: 'local'`; source docs describe a Chromium directory picker and VFS.
- Upstream production build: `npm ci && npm run build:prod`; `vite.config.ts` has no GitHub Pages subpath `base`. Its Apache `.htaccess` has no effect on GitHub Pages.
- Upstream production config hides developer-only demos; do not publish third-party/paid game data or demo mod content without rights.

**Scope of present repository:** independent M0/M1 static asset-preflight shell, *not* the imported OpenSA game engine. Do not claim gameplay is working before reproducing source build, porting the Vite public base to `/gta-sa-web/`, validating asset import, and shipping the complete corresponding source under AGPL.

## Reproduction locally (requires network)
```bash
git clone https://github.com/Avatarchik/opensa.git vendor/opensa
cd vendor/opensa
git checkout d30f4e8ad2d41a9c7965c1416d7e857b5ef5f7e6
npm ci
npm run build:prod
```

Next step is to import the reviewed corresponding upstream source into this project (preserve history where feasible, LICENSE and notices), adapt Vite URL resolution, remove any outside-network runtime dependency, and commit a **verified** static distribution to a branch for GitHub Pages. This phase cannot be certified without a successful build and user's own asset test. No GitHub Actions.
