#!/usr/bin/env bash
# Root delegating Gradle wrapper script for Karobar Pro
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/android/gradlew" ]; then
    chmod +x "$SCRIPT_DIR/android/gradlew"
    exec "$SCRIPT_DIR/android/gradlew" -p "$SCRIPT_DIR/android" "$@"
else
    echo "Error: android/gradlew not found. Please ensure the android/ directory exists."
    exit 1
fi
