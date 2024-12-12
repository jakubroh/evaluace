FROM node:18-alpine

WORKDIR /app

# Instalace závislostí pro Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++

# Nastavení proměnných prostředí pro Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Kopírování package.json a package-lock.json
COPY package*.json ./

# Instalace všech závislostí včetně devDependencies pro build
RUN npm install --quiet

# Kopírování zdrojových souborů
COPY . .

# Build aplikace
RUN npm run build

# Odstranění devDependencies a build souborů pro produkci
RUN npm prune --production && \
    rm -rf src tsconfig.json

# Expose port
EXPOSE 3001

# Spuštění aplikace
CMD ["npm", "start"] 