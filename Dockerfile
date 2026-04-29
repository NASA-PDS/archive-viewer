# Dockerfile

# Build on the host architecture so Next/SWC does not run through QEMU when
# docker-push targets linux/amd64 from Apple Silicon.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
WORKDIR /usr/src

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time vars needed for static generation/prefetch
ARG SUPPLEMENTAL_SOLR
ARG SOLR_USER
ARG SOLR_PASS
ARG USE_STATIC_PROPS_CACHE=0
ARG SOLR_MAX_CONCURRENCY=3
ARG SOLR_HTTP_RETRIES=1
ENV SUPPLEMENTAL_SOLR=$SUPPLEMENTAL_SOLR
ENV SOLR_USER=$SOLR_USER
ENV SOLR_PASS=$SOLR_PASS
ENV USE_STATIC_PROPS_CACHE=$USE_STATIC_PROPS_CACHE

RUN SOLR_MAX_CONCURRENCY=$SOLR_MAX_CONCURRENCY SOLR_HTTP_RETRIES=$SOLR_HTTP_RETRIES npm run build

FROM node:24-alpine
WORKDIR /usr/src

COPY --chown=65534:65534 --from=builder /usr/src/.next/standalone ./
COPY package*.json ./
RUN npm ci --omit=dev && rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack \
    /opt/yarn* \
    /usr/local/bin/yarn \
    /usr/local/bin/yarnpkg

COPY --chown=65534:65534 --from=builder /usr/src/.next/static ./.next/static
COPY --chown=65534:65534 --from=builder /usr/src/public ./public

ARG SUPPLEMENTAL_SOLR
ARG SOLR_USER
ARG SOLR_PASS
ARG USE_STATIC_PROPS_CACHE=0
ENV SUPPLEMENTAL_SOLR=$SUPPLEMENTAL_SOLR
ENV SOLR_USER=$SOLR_USER
ENV SOLR_PASS=$SOLR_PASS
ENV USE_STATIC_PROPS_CACHE=$USE_STATIC_PROPS_CACHE

USER 65534:65534
EXPOSE 3000
CMD ["node", "server.js"]
