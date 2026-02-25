#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-sbnpsi/context-browser:staging}"
ENV_FILE="${1:-.env.production.local}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

SOLR_USER_VALUE="${SOLR_USER:-}"
SOLR_PASS_VALUE="${SOLR_PASS:-}"

# Build the docker image (do not pass REVALIDATE_SECRET as build arg)
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SUPPLEMENTAL_SOLR="${NEXT_PUBLIC_SUPPLEMENTAL_SOLR:-}" \
  --build-arg SOLR_USER="${SOLR_USER_VALUE}" \
  --build-arg SOLR_PASS="${SOLR_PASS_VALUE}" \
  -t "$IMAGE_TAG" .

# Push to dockerhub
docker push "$IMAGE_TAG"
