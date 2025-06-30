// scripts/users-change-password.js - Helper script to change a user's password in the Inkarus database

// Usage: node scripts/users-change-password.js --username=example
//        or:   node scripts/users-change-password.js --id=1

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));
const args = require('minimist')(process.argv.slice(2));

// Accept either --username or --id
const username = args.username;
const userId = args.id;

if (!username && !userId) {
  console.log('\n❗ Usage: node scripts/users-change-password.js --username=example');
  console.log('    or:   node scripts/users-change-password.js --id=1\n');
  process.exit(1);
}

// Generate a secure random password (12 chars)
function generatePassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const newPassword = generatePassword();
const hashedPassword = bcrypt.hashSync(newPassword, 10);

const whereClause = username ? `username = ?` : `id = ?`;
const value = username || userId;

db.get(`SELECT id, username FROM users WHERE ${whereClause}`, [value], (err, user) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    return db.close();
  }

  if (!user) {
    console.log('ℹ️  User not found.');
    return db.close();
  }

  db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, user.id], function (err) {
    if (err) {
      console.error('❌ Failed to update password:', err.message);
    } else {
      console.log(`✅ Password updated for user "${user.username}"`);
      console.log(`🔑 New password: ${newPassword}`);
    }
    db.close();
  });
});
