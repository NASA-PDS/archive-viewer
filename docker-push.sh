#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-sbnpsi/context-browser:latest}"
ENV_FILE=".env.production.local"
BUILD_ONLY="${BUILD_ONLY:-0}"
FORCE_REBUILD="${FORCE_REBUILD:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build-only)
      BUILD_ONLY=1
      ;;
    --no-cache)
      FORCE_REBUILD=1
      ;;
    *)
      ENV_FILE="$1"
      ;;
  esac
  shift
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
export SOLR_USER="$SOLR_USER_VALUE"
export SOLR_PASS="$SOLR_PASS_VALUE"
export SUPPLEMENTAL_SOLR="$SUPPLEMENTAL_SOLR_VALUE"

BUILD_CMD=(
  docker buildx build
  --platform linux/amd64
  --provenance=false
  --secret id=SUPPLEMENTAL_SOLR,env=SUPPLEMENTAL_SOLR
  --secret id=SOLR_USER,env=SOLR_USER
  --secret id=SOLR_PASS,env=SOLR_PASS
  -t "$IMAGE_TAG"
  .
)
if [[ "$FORCE_REBUILD" == "1" ]]; then
  BUILD_CMD=( "${BUILD_CMD[@]:0:5}" --no-cache "${BUILD_CMD[@]:5}" )
fi

"${BUILD_CMD[@]}"

if [[ "$BUILD_ONLY" == "1" ]]; then
  echo "Build complete; skipping docker push because --build-only was set."
else
  docker push "$IMAGE_TAG"
fi
