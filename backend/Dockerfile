FROM node:18-alpine

WORKDIR /app

# Instalace závislostí pro Puppeteer a další nástroje
RUN apk update && \
    apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Nastavení proměnných prostředí pro Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Kopírování package.json a package-lock.json
COPY package*.json ./

# Instalace všech závislostí včetně devDependencies pro build
RUN npm ci

# Kopírování zdrojových souborů
COPY . .

# Build aplikace
RUN npm run build

# Odstranění devDependencies a build souborů pro produkci
RUN npm ci --only=production && \
    npm cache clean --force

# Expose port
EXPOSE 3001

# Spuštění aplikace
CMD ["npm", "start"] 