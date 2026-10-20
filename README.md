# A2 Vocabulary

A public, account-free English vocabulary learning application for Vietnamese learners. The working name is temporary; product direction lives in `PRODUCT.md` and the visual system in `DESIGN.md`.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Commands

```bash
npm install
npm run dev
npm run validate:data
npm run lint
npm run test:run
npm run test:e2e
npm run build
npm run preview
```

Progress is stored only in the current browser with no account or cloud sync.

## Architecture

- `src/data/` discovers, validates, and indexes level-based CSV/TSV vocabulary.
- `src/features/` contains pure study engines and their accessible React interfaces.
- `src/services/` owns browser persistence, downloads, and export serialization.
- `src/pages/` composes route surfaces; UI components never parse vocabulary files or call `localStorage`.

See [docs/vocabulary-data.md](docs/vocabulary-data.md) for the drop-file data workflow and stable-ID rules.

## Deployment

`npm run build` validates vocabulary and writes the static application to `dist/`. `vercel.json` rewrites application routes to `index.html`, so React Router deep links work on Vercel without Functions or a backend. Import the repository as a Vite project, keep the default build command, and use `dist` as the output directory.

The name **A2 Vocabulary** is a neutral working name. The application has no login or cloud sync; clearing site storage removes local progress.
