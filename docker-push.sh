#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-sbnpsi/context-browser:staging}"
ENV_FILE="${1:-.env.production.local}"
BUILD_ONLY="${BUILD_ONLY:-0}"

if [[ "${1:-}" == "--build-only" ]]; then
  BUILD_ONLY=1
  ENV_FILE="${2:-.env.production.local}"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

SOLR_USER_VALUE="${SOLR_USER:-}"
SOLR_PASS_VALUE="${SOLR_PASS:-}"
SUPPLEMENTAL_SOLR_VALUE="${SUPPLEMENTAL_SOLR:-${NEXT_PUBLIC_SUPPLEMENTAL_SOLR:-}}"

docker buildx build \
  --platform linux/amd64 \
  --build-arg SUPPLEMENTAL_SOLR="${SUPPLEMENTAL_SOLR_VALUE}" \
  --build-arg SOLR_USER="${SOLR_USER_VALUE}" \
  --build-arg SOLR_PASS="${SOLR_PASS_VALUE}" \
  -t "$IMAGE_TAG" \
  .

if [[ "$BUILD_ONLY" == "1" ]]; then
  echo "Build complete; skipping docker push because --build-only was set."
else
  docker push "$IMAGE_TAG"
fi
