FROM node:20

WORKDIR /app

# Optimizamos caché de capas
COPY package*.json ./
RUN npm install

COPY . .

# Generar Prisma y compilar Nuxt
RUN npx prisma generate
RUN npm run build

# CORRECCIÓN MAESTRA: Sincronizar activos en todas las posibles rutas de Nitro
RUN mkdir -p .output/server/chunks/public && \
    cp -r .output/public/* .output/server/chunks/public/

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_PUBLIC_DIR=/app/.output/public

# Exponemos el puerto
EXPOSE 3000

# Script de entrada
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
