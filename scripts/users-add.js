// scripts/users-add.js - Helper script to add a new user to the Inkarus database

// Usage: node scripts/users-add.js --username= --email= --password=

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

// Parse CLI arguments
const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, val] = arg.split('=');
  return [key.replace(/^--/, ''), val];
}));

const { username, email, password } = args;

function exitWithUsage() {
  console.log(`🧑‍💻 Usage:
  node scripts/users-add.js --username=example --email=user@domain.com --password=Secret123`);
  process.exit(1);
}

if (!username || !email || !password) {
  console.error('❌ Missing required arguments.');
  exitWithUsage();
}

(async () => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.serialize(() => {
      const insertUser = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
      db.run(insertUser, [username, email, hashedPassword], function (err) {
        if (err) {
          const msg = err.message.includes('UNIQUE')
            ? '❌ Username or email already exists.'
            : '❌ Error creating user: ' + err.message;
          return console.error(msg);
        }

        const userId = this.lastID;

        db.run(`INSERT INTO preferences (user_id) VALUES (?)`, [userId], (prefErr) => {
          if (prefErr) {
            return console.error('⚠️ User created, but failed to insert preferences:', prefErr.message);
          }

          console.log(`✅ User "${username}" created successfully with ID ${userId}`);
        });
      });
    });
  } catch (err) {
    console.error('❌ Error hashing password:', err.message);
  }
})();
