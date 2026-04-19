#!/bin/bash
# Script para subir el bot a GitHub
# Uso: bash push-to-github.sh "mensaje del commit"

REPO="https://LzXia:${GITHUB_TOKEN}@github.com/LzXia/discord-music.git"
MSG="${1:-"update: bot actualizado"}"

cd "$(dirname "$0")"

git add .
git commit -m "$MSG" 2>/dev/null || echo "Sin cambios nuevos para commitear."
git push "$REPO" HEAD:main --force 2>&1

echo ""
echo "✅ Bot subido a GitHub: https://github.com/LzXia/discord-music"
