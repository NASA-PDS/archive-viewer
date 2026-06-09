# syntax=docker/dockerfile:1.10

# Build on the host architecture so Next/SWC does not run through QEMU when
# docker-push targets linux/amd64 from Apple Silicon.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
WORKDIR /usr/src

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time Solr settings are needed for static generation/prefetch.
# Pass them as BuildKit secrets so they are available only to this RUN step,
# not stored as Dockerfile ARGs, final image ENV, or registry build args.
# SOLR_MAX_CONCURRENCY throttles in-flight Solr requests per worker process; see services/solrHttpLimit.js
ARG SOLR_MAX_CONCURRENCY=3
ENV SOLR_MAX_CONCURRENCY=$SOLR_MAX_CONCURRENCY

RUN --mount=type=secret,id=SUPPLEMENTAL_SOLR,required=true \
    --mount=type=secret,id=SOLR_USER,required=true \
    --mount=type=secret,id=SOLR_PASS,required=true \
    SUPPLEMENTAL_SOLR="$(cat /run/secrets/SUPPLEMENTAL_SOLR)" \
    SOLR_USER="$(cat /run/secrets/SOLR_USER)" \
    SOLR_PASS="$(cat /run/secrets/SOLR_PASS)" \
    npm run build


FROM node:24-alpine
WORKDIR /usr/src

# Next standalone output bundles a traced, minimal node_modules; we don't need
# npm/yarn at runtime, so strip them to slim the image and reduce CVE surface.
COPY --chown=65534:65534 --from=builder /usr/src/.next/standalone ./
COPY --chown=65534:65534 --from=builder /usr/src/.next/static ./.next/static
COPY --chown=65534:65534 --from=builder /usr/src/public ./public

RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack \
    /opt/yarn* \
    /usr/local/bin/yarn \
    /usr/local/bin/yarnpkg

# Solr endpoint and credentials are intentionally runtime-only in the final
# image. The build stage receives them as BuildKit secrets, and deploys must
# provide SUPPLEMENTAL_SOLR, SOLR_USER, and SOLR_PASS when the container starts.

USER 65534:65534
EXPOSE 3000
CMD ["node", "server.js"]
