// scripts/users-list.js
// CLI: List all users

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

db.all(`SELECT id, username, email FROM users ORDER BY id ASC`, [], (err, rows) => {
  if (err) {
    console.error('❌ Failed to fetch users:', err.message);
    return db.close();
  }

  if (!rows.length) {
    console.log('ℹ️  No users found.');
    return db.close();
  }

  console.log('\n👥 Registered Users\n');
  console.log('ID'.padEnd(5) + 'Username'.padEnd(20) + 'Email');
  console.log('-'.repeat(50));

  for (const user of rows) {
    const id = String(user.id).padEnd(5);
    const username = user.username.padEnd(20);
    console.log(`${id}${username}${user.email}`);
  }

  console.log('\n✅ Total:', rows.length, 'user(s)');
  db.close();
});
