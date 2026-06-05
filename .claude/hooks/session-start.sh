#!/bin/bash
# SessionStart hook — install dependencies so Notion scripts, the dev server,
# the linter and builds work in Claude Code on the web sessions.
# Synchronous + idempotent. Runs only in the remote (web) environment.
set -euo pipefail

# Local machines already have their own setup; only run in the cloud env.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# npm install (not ci) so the cached container layer is reused on resume.
npm install --no-audit --no-fund
