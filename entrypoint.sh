#!/bin/sh
set -e

echo "🚀 Iniciando STI SIMEP en modo profesional..."

# Esperar a la base de datos
sleep 3

# Migraciones y Seed
echo "🔄 Sincronizando base de datos..."
npx prisma migrate deploy
npx tsx prisma/seed.ts || echo "⚠️ Seed ya ejecutado."

# Lanzar aplicación
echo "✨ Iniciando servidor Nuxt..."
exec node .output/server/index.mjs
