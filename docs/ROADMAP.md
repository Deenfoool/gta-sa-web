# GTA SA Web — porting roadmap (2026-10-13)

Goal: independent, unofficial browser-compatible runtime on GitHub Pages; user supplies assets from their own original PC game installation locally. No cloud game engine, no Rockstar assets in git/deploy, no GitHub Actions. All OpenSA-derived code and corresponding source must satisfy AGPL-3.0.

## M0: Repo & source audit
- [x] Initialized target repo and audited source candidate/pinned SHA and license
- [x] Browser-only M1 preflight shell and no-upload policy
- [ ] Import complete reviewed OpenSA source, retaining attribution/license
- [ ] Reproduce clean install/build/type checks, audit dependencies/runtime calls

## M1: Pages boot & asset import
- [x] Folder input fallback and Chromium File System Access picker
- [x] Required-file presence and bounded IMG VER2 directory preflight
- [ ] Integrate OpenSA local VFS and loaders, not merely an importer diagnostic
- [ ] Fix upstream Vite base/public asset URLs for `/gta-sa-web/`
- [ ] Test the deployed release using a legitimate original PC installation

## M2: Rendered world
- [ ] DFF/TXD/COL, IDE/IPL placement, streaming and LOD verified on a real install
- [ ] Visit representative locations across Los Santos, San Fierro and Las Venturas

## M3: Player & controls
- [ ] Walk/run/jump/collisions/animation; camera and pause/input mapping

## M4: Vehicles
- [ ] Spawn, enter/exit, drive, brakes/collision; continuous streaming test

## M5: Web product
- [x] RU/EN shell and explicit unsupported-browser path
- [ ] Loading progress, settings, safe preferences, fullscreen, accessibility

## M6: Free roam systems
- [ ] Weather/time, pedestrians, traffic, police, combat, death/respawn

## M7: Campaign feasibility
- [ ] SCM/opcode and save compatibility matrix. Do not promise full campaign prematurely.

## M8: Quality and release
- [ ] Browser/performance tests, cache migration, licenses and release verification

Release policy: Pages uses **Deploy from a branch**, `main` / `(root)` for current static diagnostic release. For the engine build, generate and commit browser-ready distributable files, preserve complete source and choose a branch/root configuration; never check in private/proprietary game files.
