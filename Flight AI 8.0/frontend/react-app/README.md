# React App

## Overview
This is the frontend for Flight AI 8.0, built with React and Vite. It includes:
- Main app components
- Styles
- Playwright e2e tests

## Structure
- src/: React components and styles
- e2e/: Playwright test specs
- test-results/: Test output
- playwright-report/: Test reports

## Setup
1. Install dependencies with npm or yarn
2. Run the app with Vite
3. Execute Playwright tests

## Usage
Refer to the main project README.md for more details.

# Frontend (React)

This folder contains the React + Vite admin/demo UI used by the project.

## Local development

Install deps and run the dev server:

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
