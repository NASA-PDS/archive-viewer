#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-sbnpsi/context-browser:staging}"
ENV_FILE=".env.production.local"
USE_LOCAL_CACHE="${USE_LOCAL_CACHE:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --use-local-cache)
      USE_LOCAL_CACHE=1
      shift
      ;;
    *)
      ENV_FILE="$1"
      shift
      ;;
  esac
done

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

BUILD_CONTEXT="."
TEMP_CONTEXT=""

cleanup() {
  if [[ -n "$TEMP_CONTEXT" && -d "$TEMP_CONTEXT" ]]; then
    rm -rf "$TEMP_CONTEXT"
  fi
}

trap cleanup EXIT

if [[ "$USE_LOCAL_CACHE" == "1" ]]; then
  CACHE_DIR=".next/static-props-cache"
  if [[ ! -d "$CACHE_DIR" ]]; then
    echo "Local static props cache not found at $CACHE_DIR"
    echo "Run npm run build locally first so cached props can be collected."
    exit 1
  fi
  if [[ -z "$(find "$CACHE_DIR" -type f -print -quit)" ]]; then
    echo "Local static props cache is empty at $CACHE_DIR"
    echo "Run npm run build locally first so cached props can be collected."
    exit 1
  fi
  if ! command -v rsync >/dev/null 2>&1; then
    echo "rsync is required for --use-local-cache"
    exit 1
  fi
  TEMP_CONTEXT="$(mktemp -d)"
  BUILD_CONTEXT="$TEMP_CONTEXT"
  rsync -a \
    --exclude node_modules \
    --exclude .git \
    --exclude .next \
    --exclude .env \
    --exclude .env.local \
    --exclude .env.development.local \
    --exclude .env.production.local \
    ./ "$TEMP_CONTEXT/"
  mkdir -p "$TEMP_CONTEXT/.next"
  cp -R "$CACHE_DIR" "$TEMP_CONTEXT/.next/static-props-cache"
fi

# Build the docker image (do not pass REVALIDATE_SECRET as build arg)
docker buildx build \
  --platform linux/amd64 \
  --build-arg SUPPLEMENTAL_SOLR="${SUPPLEMENTAL_SOLR_VALUE}" \
  --build-arg SOLR_USER="${SOLR_USER_VALUE}" \
  --build-arg SOLR_PASS="${SOLR_PASS_VALUE}" \
  --build-arg USE_STATIC_PROPS_CACHE="${USE_LOCAL_CACHE}" \
  -t "$IMAGE_TAG" \
  "$BUILD_CONTEXT"

# Push to dockerhub
docker push "$IMAGE_TAG"
