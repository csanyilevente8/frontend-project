# Todo Frontend (Angular)

Angular single-page application for the full-stack Todo project. Uses
standalone components, the Angular Router, Reactive Forms and `HttpClient`.

## Architecture

```
src/app/
├── components/
│   ├── todo-list/   list, completion toggle, delete, loading/error/empty states
│   └── todo-form/   reusable create + edit form (Reactive Forms)
├── services/
│   └── todo.service.ts   all HTTP communication with the backend
├── models/
│   └── todo.model.ts     TypeScript interfaces
└── app.routes.ts         routes
```

Components never call `HttpClient` directly; all API access goes through
`TodoService`.

## Prerequisites

- Node.js LTS
- npm

The Angular CLI is available through `npx` / the local dev dependency, so a
global install is optional:

```bash
npx ng version
```

## Configuration

API URLs are not hardcoded in components. They live in environment files:

- `src/environments/environment.ts` (development) – `apiUrl: http://localhost:8080/api`
- `src/environments/environment.prod.ts` (production) – `apiUrl: /api`

`angular.json` replaces the development file with the production file for
production builds, so the backend URL can be changed for GKE without touching
component code.

## Install dependencies

```bash
npm ci
```

## Run the app

```bash
npm start
```

The dev server runs on http://localhost:4200 and talks to the backend at
`http://localhost:8080/api`. Make sure the backend and PostgreSQL are running
(see the workspace root README).

## Run tests

```bash
npm test
```

Tests use the Angular unit-test builder (Vitest) and cover the service, the
list and form components, creation, editing, deletion, completion, loading,
error and empty states, and form validation.

## Build

```bash
npm run build
```

Production output is written to `dist/frontend`.

## GitHub Actions

CI is defined in `.github/workflows/frontend-ci.yml` but is **currently
disabled**: the workflow file is entirely commented out, so pushing to GitHub
does not trigger any build.

When enabled, it sets up Node.js LTS, runs `npm ci`, `npm test` and
`npm run build`, and fails the build if tests or the build fail. It is
configured to run on the `main` branch and on pull requests.

To enable it, open the workflow file and uncomment the block (remove the leading
`# ` from each line).
