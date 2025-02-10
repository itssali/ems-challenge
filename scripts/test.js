import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

console.log('🧪 Running System Tests...\n');

// Test 1: Database Connection
console.log('1️⃣  Testing Database Connection...');
db.get('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connection successful\n');
  }
});

// Test 2: Employee Table Structure
console.log('2️⃣  Verifying Employee Table Structure...');
db.all("PRAGMA table_info(employees)", (err, columns) => {
  if (err) {
    console.error('❌ Failed to get employee table structure:', err);
  } else {
    const requiredColumns = [
      'id', 'full_name', 'email', 'phone', 'date_of_birth',
      'job_title', 'department', 'salary', 'start_date'
    ];
    const missingColumns = requiredColumns.filter(
      col => !columns.find(c => c.name === col)
    );
    
    if (missingColumns.length === 0) {
      console.log('✅ Employee table structure is valid\n');
    } else {
      console.error('❌ Missing columns:', missingColumns.join(', '), '\n');
    }
  }
});

// Test 3: Timesheet Table Structure
console.log('3️⃣  Verifying Timesheet Table Structure...');
db.all("PRAGMA table_info(timesheets)", (err, columns) => {
  if (err) {
    console.error('❌ Failed to get timesheet table structure:', err);
  } else {
    const requiredColumns = [
      'id', 'employee_id', 'start_time', 'end_time', 'summary'
    ];
    const missingColumns = requiredColumns.filter(
      col => !columns.find(c => c.name === col)
    );
    
    if (missingColumns.length === 0) {
      console.log('✅ Timesheet table structure is valid\n');
    } else {
      console.error('❌ Missing columns:', missingColumns.join(', '), '\n');
    }
  }
});

// Test 4: Foreign Key Constraints
console.log('4️⃣  Checking Foreign Key Constraints...');
db.all(`
  SELECT sql 
  FROM sqlite_master 
  WHERE type='table' AND name='timesheets'
`, (err, result) => {
  if (err) {
    console.error('❌ Failed to check foreign key constraints:', err);
  } else {
    const sql = result[0].sql.toLowerCase();
    if (sql.includes('foreign key') && sql.includes('references employees')) {
      console.log('✅ Foreign key constraints are properly set up\n');
    } else {
      console.error('❌ Missing foreign key constraints\n');
    }
  }
});

// Test 5: Sample Data
console.log('5️⃣  Verifying Sample Data...');
Promise.all([
  new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM employees', (err, result) => {
      if (err) {
        console.error('❌ Failed to count employees:', err);
      } else {
        console.log(`✅ Found ${result.count} employees`);
      }
      resolve();
    });
  }),
  new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM timesheets', (err, result) => {
      if (err) {
        console.error('❌ Failed to count timesheets:', err);
      } else {
        console.log(`✅ Found ${result.count} timesheets`);
      }
      resolve();
    });
  })
]).then(() => {
  console.log('\n🎉 System Test Complete!\n');
  db.close();
}); 