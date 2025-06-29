// scripts/generate-parts.js – Generate Parts (e.g. Acts, Volumes) for Inkarus
// Usage: node scripts/generate-parts.js --project=1 [--count=3] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const generatePartData = require('../lib/generatePartData');

// Parse CLI arguments
const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const projectArg = args.find(arg => arg.startsWith('--project='));
const verbose = args.includes('--verbose') || args.includes('-v');

const count = countArg ? parseInt(countArg.split('=')[1], 10) : 3;
const projectId = projectArg ? parseInt(projectArg.split('=')[1], 10) : null;

if (!projectId || isNaN(projectId)) {
  console.error('❌ Missing required argument: --project=<ID>');
  console.log('\nUsage: node scripts/generate-parts.js --project=1 [--count=3] [--verbose|-v]');
  process.exit(1);
}

const db = new sqlite3.Database(path.resolve('db/database.sqlite'));

db.serialize(() => {
  // Validate that the project exists
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

    console.log(`\n📚 Generating ${count} fake parts for project ID ${projectId}...\n`);

    const stmt = db.prepare(`
      INSERT INTO parts (project_id, title, "order")
      VALUES (?, ?, ?)
    `);

    for (let i = 0; i < count; i++) {
      const [pid, title, order] = generatePartData(projectId, i);

      if (verbose) {
        console.log(`➕ ${title} (order: ${order})`);
      }

      stmt.run(pid, title, order);
    }

    stmt.finalize(() => {
      console.log(`\n✅ Successfully inserted ${count} parts into project ${projectId}.\n`);
      db.close();
    });
  });
});
