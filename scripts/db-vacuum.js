// scripts/db-vacuum.js - Vacuum to reduce SQLite DB file size

// This script runs a VACUUM command on the SQLite database to reduce its file size.
// It should be run periodically to maintain optimal database performance.

// Usage: node scripts/db-vacuum.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Running VACUUM to reduce DB file size...');

db.exec('VACUUM;', (err) => {
  if (err) {
    console.error('❌ VACUUM failed:', err.message);
  } else {
    console.log('✅ VACUUM completed successfully.');
  }
  db.close();
});
