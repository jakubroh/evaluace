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
    ttf-freefont

# Nastavení proměnných prostředí pro Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Kopírování package.json a package-lock.json
COPY package*.json ./

# Instalace závislostí
RUN npm install --production --silent

# Kopírování zdrojových souborů
COPY . .

# Build aplikace
RUN npm run build

# Expose port
EXPOSE 3001

# Spuštění aplikace
CMD ["npm", "start"] 