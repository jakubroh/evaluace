FROM node:18-alpine

WORKDIR /app

# Kopírování package.json a package-lock.json
COPY package*.json ./

# Instalace závislostí
RUN npm install

# Kopírování zdrojových souborů
COPY . .

# Build aplikace
RUN npm run build

# Expose port
EXPOSE 3001

# Spuštění aplikace
CMD ["npm", "start"] 