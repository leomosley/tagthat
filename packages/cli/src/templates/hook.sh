#!/usr/bin/env bash
# tagthat:pre-push
# tagthat — plays your producer tag on push
# https://github.com/leomosley/tagthat

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
TAGTHAT_DIR="$REPO_ROOT/.tagthat"

# Slugify git user.name (matches TypeScript slugify() exactly)
GIT_NAME="$(git config user.name 2>/dev/null || true)"
SLUG="$(printf '%s' "$GIT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/^-*//' | sed 's/-*$//')"

if [ -z "$SLUG" ]; then
  exit 0
fi

# Find audio file (.mp3 first, then .wav)
AUDIO_FILE=""
if [ -f "$TAGTHAT_DIR/$SLUG/$SLUG.mp3" ]; then
  AUDIO_FILE="$TAGTHAT_DIR/$SLUG/$SLUG.mp3"
elif [ -f "$TAGTHAT_DIR/$SLUG/$SLUG.wav" ]; then
  AUDIO_FILE="$TAGTHAT_DIR/$SLUG/$SLUG.wav"
fi

if [ -z "$AUDIO_FILE" ]; then
  exit 0
fi

# Detect file extension
EXT="${AUDIO_FILE##*.}"

# Play in background — never block the push
OS="$(uname -s 2>/dev/null || true)"
case "$OS" in
  Darwin)
    afplay "$AUDIO_FILE" >/dev/null 2>&1 &
    ;;
  Linux)
    if [ "$EXT" = "wav" ] && command -v aplay >/dev/null 2>&1; then
      aplay "$AUDIO_FILE" >/dev/null 2>&1 &
    elif [ "$EXT" = "wav" ] && command -v paplay >/dev/null 2>&1; then
      paplay "$AUDIO_FILE" >/dev/null 2>&1 &
    elif [ "$EXT" = "mp3" ] && command -v mpg123 >/dev/null 2>&1; then
      mpg123 -q "$AUDIO_FILE" >/dev/null 2>&1 &
    elif command -v ffplay >/dev/null 2>&1; then
      ffplay -nodisp -autoexit "$AUDIO_FILE" >/dev/null 2>&1 &
    fi
    ;;
  MINGW*|MSYS*|CYGWIN*)
    if [ "$EXT" = "wav" ]; then
      powershell.exe -NoProfile -NonInteractive -Command "(New-Object Media.SoundPlayer '$AUDIO_FILE').PlaySync()" >/dev/null 2>&1 &
    elif command -v ffplay >/dev/null 2>&1; then
      ffplay -nodisp -autoexit "$AUDIO_FILE" >/dev/null 2>&1 &
    fi
    ;;
esac

# Always exit 0 — never block the push
exit 0
