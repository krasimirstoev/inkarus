// scripts/generate-projects.js - Helper script to generate fake projects for a user in the Inkarus app

// Usage: node scripts/generate-projects.js --user=1 [--count=3] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { faker } = require('@faker-js/faker');

// Call the library to generate project data
const generateProjectData = require('../lib/generateProjectData');

const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const userArg = args.find(arg => arg.startsWith('--user='));
const verbose = args.includes('--verbose') || args.includes('-v');

const count = countArg ? parseInt(countArg.split('=')[1], 10) : 3;
const userId = userArg ? parseInt(userArg.split('=')[1], 10) : null;

if (!userId || isNaN(userId)) {
  console.error('❌ Missing required argument: --user=<ID>');
  console.log('\nUsage: node scripts/generate-projects.js --user=1 [--count=3] [--verbose|-v]');
  process.exit(1);
}

const db = new sqlite3.Database(path.resolve('db/database.sqlite'));

// Helper to generate realistic descriptions
function generateDescription() {
  const themes = [
    'memory and identity',
    'power and corruption',
    'loss and redemption',
    'the duality of human nature',
    'love and betrayal',
    'the search for meaning',
    'dreams versus reality',
    'family and legacy'
  ];
  const genre = faker.helpers.arrayElement([
    'literary fiction',
    'psychological thriller',
    'historical novel',
    'dystopian fantasy',
    'philosophical drama',
    'post-apocalyptic journey',
    'absurdist satire'
  ]);

  const theme = faker.helpers.arrayElement(themes);
  return `A ${genre} exploring the theme of ${theme}.`;
}

db.serialize(() => {
  // Check if user exists
  db.get(`SELECT id FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      console.error('❌ Failed to query users:', err.message);
      db.close();
      process.exit(1);
    }

    if (!row) {
      console.error(`❌ User with ID ${userId} does not exist.`);
      db.close();
      process.exit(1);
    }

    console.log(`\n📚 Generating ${count} fake projects for user ID ${userId}...\n`);

    const stmt = db.prepare(`
      INSERT INTO projects (user_id, title, description)
      VALUES (?, ?, ?)
    `);

    for (let i = 0; i < count; i++) {
      const [_, title, description] = generateProjectData(userId);

      if (verbose) {
        console.log(`➕ ${title} – ${description}`);
      }

      stmt.run(userId, title, description);
    }

    stmt.finalize(() => {
      console.log(`\n✅ Successfully inserted ${count} project(s) for user ${userId}.\n`);
      db.close();
    });
  });
});
