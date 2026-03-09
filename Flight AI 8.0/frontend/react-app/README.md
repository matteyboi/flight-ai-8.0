# Frontend (React)

This folder contains the React + Vite admin/demo UI used by the project.

## Local development

Install deps and run the dev server:

```bash
cd frontend/react-app
npm install
npm run dev
```

The app assumes the backend is available at `http://localhost:5051` by default. You can override with `VITE_API_BASE`.

## E2E tests (Playwright)

The project includes Playwright E2E tests that exercise the UI and backend.

To run the E2E suite locally:

```bash
cd frontend/react-app
npm install
npx playwright install --with-deps
npm run build
npm run test:e2e
```

Notes:
- Locally: use the convenience script to start the backend and preview together:

```bash
npm run preview:e2e
```

Then in another terminal run the E2E suite:

```bash
npm run test:e2e
```

- On CI the workflow starts the backend before running Playwright.

*** End of file
