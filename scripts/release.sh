#!/usr/bin/env bash
set -euo pipefail

TAG=""
MSG=""
FORCE=false

# Parse args: allow --force before or after tag/message
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      FORCE=true
      shift
      ;;
    *)
      if [[ -z "$TAG" ]]; then
        TAG="$1"
      elif [[ -z "$MSG" ]]; then
        MSG="$1"
      else
        echo "Warning: extra argument '$1' ignored"
      fi
      shift
      ;;
  esac
done

if [[ -z "$TAG" ]]; then
  echo "Usage: npm run release -- <tag> [\"Release Title\"] [--force]"
  echo "Examples:"
  echo "  npm run release -- managers-media-v0.03 \"Managers Media v0.03\""
  echo "  npm run release -- v0.03.0 \"v0.03.0\""
  echo "Options:"
  echo "  --force   Recreate and re-push tag (deletes remote tag if present)"
  exit 1
fi

if [[ -z "$MSG" ]]; then
  MSG="$TAG"
fi

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: not a git repository (or any of the parent directories)."
  exit 1
fi

if [[ -z "$(git remote)" ]]; then
  echo "Error: no git remote configured (e.g., origin)."
  exit 1
fi

if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  if [[ "$FORCE" == true ]]; then
    echo "Tag '${TAG}' exists locally; deleting to recreate (force mode)."
    git tag -d "$TAG"
  else
    echo "Error: tag '${TAG}' already exists locally. Use --force to recreate and re-push."
    exit 1
  fi
fi

echo "Creating annotated tag '${TAG}' with message: ${MSG}"
git tag -a "${TAG}" -m "${MSG}"

if [[ "$FORCE" == true ]]; then
  echo "Deleting remote tag '${TAG}' if it exists (force mode)."
  # Delete remote tag to retrigger workflows reliably; ignore errors
  git push origin ":refs/tags/${TAG}" || true
fi

echo "Pushing tag '${TAG}' to origin"
if [[ "$FORCE" == true ]]; then
  git push --force origin "${TAG}"
else
  git push origin "${TAG}"
fi

echo "Done. Check GitHub Actions and Releases page for publication."
