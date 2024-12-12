import dotenv from 'dotenv';
import { Pool } from 'pg';

// Načtení testovacího .env souboru
dotenv.config({ path: '.env.test' });

// Vytvoření testovací databáze
export const testPool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: false
});

// Před spuštěním testů
beforeAll(async () => {
  // Vyčistit testovací databázi a znovu vytvořit schéma
  await testPool.query(`
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
  `);
  
  // Načíst a spustit schema.sql
  const schema = require('fs').readFileSync('./src/db/schema.sql', 'utf8');
  await testPool.query(schema);
});

// Po dokončení všech testů
afterAll(async () => {
  await testPool.end();
}); 