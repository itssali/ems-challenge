import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
  'schema_setup_path': schemaSetupPath
} = dbConfig;

// Create uploads directory
const publicDir = path.join(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'uploads');

try {
  // Create public and uploads directories if they don't exist
  await mkdir(publicDir, { recursive: true });
  await mkdir(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory structure');
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

const db = new sqlite3.Database(sqlitePath);

const setupSql = fs.readFileSync(schemaSetupPath, 'utf8');

console.log('Executing setup script from:', sqlitePath);
db.exec(setupSql, (err) => {
  if (err) {
    console.error('Error executing setup script:', err);
  } else {
    console.log('✅ Database recreated successfully');
  }
  db.close();
});
