// scripts/generate-items.js – Helper script to generate fake items for a project

// Usage: node scripts/generate-items.js --project=<ID> [--count=5] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const generateItemData = require('../lib/generateItemData');

// Parse arguments
const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const projectArg = args.find(arg => arg.startsWith('--project='));
const verbose = args.includes('--verbose') || args.includes('-v');

const count = countArg ? parseInt(countArg.split('=')[1], 10) : 5;
const projectId = projectArg ? parseInt(projectArg.split('=')[1], 10) : null;

if (!projectId || isNaN(projectId)) {
  console.error('❌ Missing required argument: --project=<ID>');
  console.log('\nUsage: node scripts/generate-items.js --project=1 [--count=5] [--verbose|-v]');
  process.exit(1);
}

const db = new sqlite3.Database(path.resolve('db/database.sqlite'));

db.serialize(() => {
  db.get(`SELECT id FROM projects WHERE id = ?`, [projectId], (err, row) => {
    if (err) {
      console.error('❌ Failed to query projects:', err.message);
      db.close();
      process.exit(1);
    }

    if (!row) {
      console.error(`❌ Project with ID ${projectId} does not exist.`);
      db.close();
      process.exit(1);
    }

    console.log(`\n📦 Generating ${count} fake items for project ID ${projectId}...\n`);

    const stmt = db.prepare(`
      INSERT INTO items (project_id, name, description, status, custom_status)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < count; i++) {
      const [pid, name, description, status, customStatus] = generateItemData(projectId);

      if (verbose) {
        const statusDisplay = status === 'custom' ? `custom → ${customStatus}` : status;
        console.log(`➕ ${name} (${statusDisplay})`);
      }

      stmt.run(pid, name, description, status, customStatus);
    }

    stmt.finalize(() => {
      console.log(`\n✅ Successfully inserted ${count} items into project ${projectId}.\n`);
      db.close();
    });
  });
});
