# Archive Navigator

The Archive Navigator (formerly known as Context Browser/Archive Viewer) is a front-end web application for displaying certain context objects and datasets in the PDS Archive. It interfaces with multiple instances of the PDS Registry to pull in core and supplemental metadata for user-friendly display. The back-end content management system for Archive Navigator can be found here: [https://github.com/sbn-psi/archive-loader](https://github.com/sbn-psi/archive-loader)

## Primary Technologies

Archive Navigator is a javascript application built in [React](http://reactjs.org). It uses [NextJS](http://nextjs.org) as a backend for server-side rendering, caching of certain requests to the registries, and a proxy to route requests from the front-end to various registries. The interface is primarily implemented using [MaterialUI](https://material-ui.com/) components, including the theme services to handle light/dark mode. Additional styling is handled in each component file with either [Material's styling library](https://material-ui.com/styles/basics/) or [Styled JSX inside Next](https://nextjs.org/blog/styling-next-with-styled-jsx).

## Environment setup

This application interfaces directly with interfaces of the PDS Registry running on Solr. It expects a certain collection structure, but it can stitch together metadata from multiple instances of the registry: One with all context objects and datasets ingested at a high level, and another that is managed by [Archive Loader](https://github.com/sbn-psi/archive-loader) for providing supplemental metadata not found in the core registry.

### .env

The locations of these registries are set in environment variables. The defaults are set in `.env`, but you can override these values for testing, or to work around CORS issues (see below) by creating an adjacent file named **`.env.development.local`** and setting your own endpoints.

## Build and Deploy

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
