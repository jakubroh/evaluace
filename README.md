# Evaluační systém - Než zazvoní

Webová aplikace pro sběr a vyhodnocování zpětné vazby od studentů na kvalitu výuky.

## Funkce

- Administrace škol, tříd a učitelů
- Generování přístupových kódů pro studenty
- Sběr hodnocení pomocí formulářů
- Statistiky a reporty
- Export dat do CSV a PDF
- Zabezpečený přístup pro administrátory a ředitele

## Technologie

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- Headless UI

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT autentizace
- Jest pro testy

## Požadavky

- Node.js 18+
- PostgreSQL 14+
- npm nebo yarn

## Instalace

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Vytvořte a upravte konfigurační soubor
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Vytvořte a upravte konfigurační soubor
npm run build
npm start
```

## Vývoj

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

## Databáze

Pro inicializaci databáze použijte SQL skript v `backend/src/db/schema.sql`.

## Testy

```bash
# Backend testy
cd backend
npm test

# Spuštění testů s watch módem
npm run test:watch

# Generování test coverage
npm run test:coverage
```

## Struktura projektu

```
.
├── backend/               # Node.js + Express backend
│   ├── src/              # Zdrojové soubory
│   │   ├── controllers/  # Kontrolery
│   │   ├── routes/       # API endpointy
│   │   ├── models/       # Databázové modely
│   │   ├── middleware/   # Middleware funkce
│   │   └── db/          # Databázové skripty
│   └── tests/           # Testy
│
└── frontend/            # Next.js frontend
    ├── src/            # Zdrojové soubory
    │   ├── app/       # Next.js stránky a komponenty
    │   ├── components/ # React komponenty
    │   └── lib/       # Pomocné funkce a utility
    └── public/        # Statické soubory

```

## Deployment

### Backend
- Podporuje deployment na platformy jako Railway, Heroku nebo DigitalOcean
- Vyžaduje PostgreSQL databázi
- Nastavení pomocí proměnných prostředí

### Frontend
- Optimalizováno pro deployment na Vercel
- Statické generování stránek
- Automatické CI/CD

## Bezpečnost

- JWT autentizace
- Validace vstupů
- CORS ochrana
- Rate limiting
- Bezpečné ukládání hesel (bcrypt)

## Licence

Tento projekt je licencován pod MIT licencí. 