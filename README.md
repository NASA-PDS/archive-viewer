# Archive Navigator

The Archive Navigator (formerly known as Context Browser/Archive Viewer) is a front-end web application for displaying certain context objects and datasets in the PDS Archive. It interfaces with multiple instances of the PDS Registry to pull in core and supplemental metadata for user-friendly display. The back-end content management system for Archive Navigator can be found here: [https://github.com/sbn-psi/archive-loader](https://github.com/sbn-psi/archive-loader)

## Primary Technologies

Archive Navigator is a javascript application built in [React](http://reactjs.org). It uses [NextJS](http://nextjs.org) as a backend for server-side rendering, caching of certain requests to the registries, and a proxy to route requests from the front-end to various registries. The interface is primarily implemented using [MaterialUI](https://material-ui.com/) components, including the theme services to handle light/dark mode. Additional styling is handled in each component file with either [Material's styling library](https://material-ui.com/styles/basics/) or [Styled JSX inside Next](https://nextjs.org/blog/styling-next-with-styled-jsx).

## Environment setup

This application interfaces directly with interfaces of the PDS Registry running on Solr. It expects a certain collection structure, but it can stitch together metadata from multiple instances of the registry: One with all context objects and datasets ingested at a high level, and another that is managed by [Archive Loader](https://github.com/sbn-psi/archive-loader) for providing supplemental metadata not found in the core registry.

### .env

The locations of these registries are set in environment variables. The defaults are set in `.env`, but you can override these values for testing, or to work around CORS issues (see below) by creating an adjacent file named **`.env.development.local`** and setting your own endpoints.

Use `SUPPLEMENTAL_SOLR` as the single source of truth for the Solr base URL. Server-side code reads that value at runtime and the browser talks to Solr through this app's `/api/proxy/*` routes rather than calling Solr directly.

## Build and Deploy

Docker builds pass `SUPPLEMENTAL_SOLR`, `SOLR_USER`, and `SOLR_PASS` as BuildKit secrets so Next.js can statically generate and prefetch pages during `npm run build` without recording them as image or registry build args. Those values are not set as defaults in the final runtime image; deployment must provide the Solr endpoint and credentials when the container starts.

Use `./docker-push.sh --no-cache` when you need to force a fresh static generation run, such as after changing the build-time Solr index. Combine it with `--build-only` to rebuild locally without pushing.

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Compiles the application for use by NextJS, optimized for production.

### `npm run start`

Runs the compiled production-ready application on port 3000.

## Browser smoke tests

After updating dependencies, run:

```sh
npm ci
npx playwright install chromium # First run, or after upgrading Playwright
npm test
npm run test:smoke
```

The smoke command builds the production app in `.next-smoke`, starts it on
`127.0.0.1:3100`, and starts a small Solr fixture on `127.0.0.1:3101`. Both ports
must be free. The servers stop when the tests finish; your normal `.next` build
and local Solr credentials are preserved. No production registry or credentials
are required.

Five journeys run in Chromium at desktop and mobile sizes: the home page and
featured target navigation, keyboard submission of a versioned LID and reload,
derived data table expansion and collection/bundle navigation, tag search
through the real proxy, and light/dark cookie handling on a server-rendered
search page. Tests fail on uncaught exceptions, console errors (including
hydration errors), HTTP errors, failed requests, and unexpected external traffic.
The fixture checks Basic auth and returns representative core and supplemental
records, so the actual Axios requests and proxy middleware run during the tests.

Third-party header widgets, reCAPTCHA, and Google Fonts are stubbed at their
known URLs. These tests check application regressions; they do not validate
those services, the live registry schema/content, or Firefox/Safari behavior.

Use `npm run test:smoke:headed` to watch the tests. On failure, screenshots and
traces are saved under `test-results/`; use `npx playwright show-report` for the
HTML report or `npx playwright show-trace <trace.zip>` for a recorded trace.

The separate Browser Smoke Tests workflow runs unit and browser tests on pull
requests (including Dependabot updates) and manual dispatch. It uses Node 24,
requires no registry credentials, and uploads the browser report and failure
artifacts. Existing organization security and project workflows are unchanged.
