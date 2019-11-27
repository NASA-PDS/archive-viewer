# Archive Viewer

The Archive Viewer (now better known as the "Context Browser" is a front-end web application for displaying certain context objects and datasets in the PDS Archive. It interfaces with multiple instances of the PDS Registry to pull in core and supplemental metadata for user-friendly display. The back-end content management system for the Context Browser can be found here: [https://github.com/sbn-psi/archive-loader](https://github.com/sbn-psi/archive-loader)

## Environment setup

This application interfaces directly with interfaces of the PDS Registry running on Solr. It expects a certain collection structure, but it can stitch together metadata from multiple instances of the registry: One with all context objects and datasets ingested at a high level, and another that is managed by [Archive Loader](https://github.com/sbn-psi/archive-loader) for providing supplemental metadata not found in the core registry.

### .env

The locations of these registries are set in environment variables. The defaults are set in `.env`, but you can override these values for testing, or to work around CORS issues (see below) by creating an adjacent file named **`.env.development.local`** and setting your own endpoints.

### CORS
Since this application makes all of its network calls on the front-end, running in a non-whitelisted environment might cause issues with [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). One way to do this is to set up a proxy server that will forward all requests, and override the endpoints with `.env.local` or `.env.development.local`. 

You can use my [Request Router](https://github.com/mdrum/request-router) for this purpose, or any number of other tools. Then, you'd want to set your `env.development.local` variables to 
```
REACT_APP_SUPPLEMENTAL_SOLR=http://localhost:1001/https://sbnpds4.psi.edu/solr
REACT_APP_CORE_SOLR=http://localhost:1001/https://pds-gamma.jpl.nasa.gov/services/search
```

## Build and Deploy

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

This process will generate a single page and set of resources that can be deployed on any static web server like Apache.
