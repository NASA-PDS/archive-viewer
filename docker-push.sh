#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-sbnpsi/context-browser:latest}"
ENV_FILE=".env.production.local"
BUILD_ONLY="${BUILD_ONLY:-0}"
FORCE_REBUILD="${FORCE_REBUILD:-0}"
RELEASE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build-only)
      BUILD_ONLY=1
      ;;
    --no-cache)
      FORCE_REBUILD=1
      ;;
    --release)
      RELEASE=1
      ;;
    --help)
      echo "Usage: $0 [--release] [--build-only] [--no-cache] [env-file]"
      echo "--release publishes package.json's vX.Y.Z tag and latest from a clean, tagged commit."
      exit 0
      ;;
    --*)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
    *)
      ENV_FILE="$1"
      ;;
  esac
  shift
done

IMAGE_TAGS=("$IMAGE_TAG")
if [[ "$RELEASE" == "1" ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Release requires a clean working tree (including untracked files)." >&2
    exit 1
  fi
  VERSION="$(node -p 'require("./package.json").version')"
  if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Release requires a stable X.Y.Z package version." >&2
    exit 1
  fi
  RELEASE_TAG="v$VERSION"
  if [[ "$(git rev-parse -q --verify "refs/tags/$RELEASE_TAG^{commit}")" != "$(git rev-parse HEAD)" ]]; then
    echo "HEAD must have tag $RELEASE_TAG; use npm version patch, minor, or major." >&2
    exit 1
  fi
  IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-sbnpsi/context-browser}"
  IMAGE_TAGS=("$IMAGE_REPOSITORY:$RELEASE_TAG" "$IMAGE_REPOSITORY:latest")
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
)
if [[ "$FORCE_REBUILD" == "1" ]]; then
  BUILD_CMD+=(--no-cache)
fi
for tag in "${IMAGE_TAGS[@]}"; do
  BUILD_CMD+=(-t "$tag")
done
if [[ "$BUILD_ONLY" == "1" ]]; then
  BUILD_CMD+=(--load)
else
  BUILD_CMD+=(--push)
fi
BUILD_CMD+=(.)

"${BUILD_CMD[@]}"

if [[ "$BUILD_ONLY" == "1" ]]; then
  echo "Build complete; skipping docker push because --build-only was set."
else
  echo "Published: ${IMAGE_TAGS[*]}"
fi
