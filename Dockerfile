# Build on the host architecture so Next/SWC does not run through QEMU when
# docker-push targets linux/amd64 from Apple Silicon.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
WORKDIR /usr/src

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time vars needed for static generation/prefetch.
# SOLR_MAX_CONCURRENCY throttles in-flight Solr requests per worker process; see services/solrHttpLimit.js
ARG SUPPLEMENTAL_SOLR
ARG SOLR_USER
ARG SOLR_PASS
ARG SOLR_MAX_CONCURRENCY=3
ENV SUPPLEMENTAL_SOLR=$SUPPLEMENTAL_SOLR
ENV SOLR_USER=$SOLR_USER
ENV SOLR_PASS=$SOLR_PASS
ENV SOLR_MAX_CONCURRENCY=$SOLR_MAX_CONCURRENCY

RUN npm run build


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

ARG SUPPLEMENTAL_SOLR
ARG SOLR_USER
ARG SOLR_PASS
ENV SUPPLEMENTAL_SOLR=$SUPPLEMENTAL_SOLR
ENV SOLR_USER=$SOLR_USER
ENV SOLR_PASS=$SOLR_PASS

USER 65534:65534
EXPOSE 3000
CMD ["node", "server.js"]
