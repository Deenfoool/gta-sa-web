# GTA SA Web — unofficial browser compatibility port

An independent, static-site project targeting the **original PC GTA: San Andreas** data files supplied by the user. Not affiliated with Rockstar Games or Take-Two.

**Current status:** M0/M1 local-file preflight only; this is **not playable GTA SA** yet. The page scans local file metadata, checks the required install paths and reads the bounded directory of `models/gta3.img` (IMG VER2). It does not upload game files or execute the original game. No Rockstar assets or binaries are distributed.

- Preview URL after enabling GitHub Pages: https://deenfoool.github.io/gta-sa-web/
- Source-engine candidate (not yet imported): [OpenSA preserved fork](https://github.com/Avatarchik/opensa), commit `d30f4e8ad2d41a9c7965c1416d7e857b5ef5f7e6`
- [Development roadmap](docs/ROADMAP.md) · [Upstream audit and build notes](docs/UPSTREAM.md)
- This project's source is licensed under [AGPL-3.0-only](LICENSE). Copyright (c) 2026 Aleksandrov Sergey for OpenSA upstream code (not yet copied); original notices must be preserved upon upstream import.

## Try the preflight locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
node --test tests/*.test.mjs
```

Use a current desktop Chromium browser for the native directory picker; the fallback directory input may work on other browsers. Provide your own game installation. No game folder needs to be copied into this repository.

## Deploy (no GitHub Actions)

GitHub repository → Settings → Pages → Build and deployment → **Deploy from a branch** → `main` → `/(root)` → Save. The current project is plain static HTML/CSS/JS with relative URLs and needs no build. It does not require a backend.

**Privacy:** Imported files stay local in memory; only the UI language is stored in `localStorage`. Do not commit source game assets or upload folders containing them to GitHub.

This website is a compatibility experiment, not a copy of the commercial game. GTA, San Andreas and other marks remain the property of their respective owners and are mentioned descriptively.
