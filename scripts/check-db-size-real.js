// scripts/check-db-size-raw.js - Helper script to check raw size of SQLite DB

// Usage: node scripts/check-db-size-raw.js
// Check raw size of SQLite DB using page_count * page_size

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('📏 Estimating total database file size...\n');

db.serialize(() => {
  db.get(`PRAGMA page_count`, (err, page) => {
    if (err) return console.error('❌ Error getting page_count:', err.message);

    db.get(`PRAGMA page_size`, (err2, size) => {
      if (err2) return console.error('❌ Error getting page_size:', err2.message);

      const totalBytes = page.page_count * size.page_size;
      const mb = (totalBytes / 1024 / 1024).toFixed(2);
      const kb = (totalBytes / 1024).toFixed(2);

      console.log(`📦 Raw size (based on page_count * page_size):`);
      console.log(`➡️  ${mb} MB / ${kb} KB`);

      db.close();
    });
  });
});
