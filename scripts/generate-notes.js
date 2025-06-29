// scripts/generate-notes.js - Helper script to generate fake notes for a project in the Inkarus app
// Usage: node scripts/generate-notes.js --project=<ID> [--count=10] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const generateNoteData = require('../lib/generateNoteData');

// Parse CLI arguments
const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const projectArg = args.find(arg => arg.startsWith('--project='));
const verbose = args.includes('--verbose') || args.includes('-v');

const count = countArg ? parseInt(countArg.split('=')[1], 10) : 5;
const projectId = projectArg ? parseInt(projectArg.split('=')[1], 10) : null;

if (!projectId || isNaN(projectId)) {
  console.error('❌ Missing required argument: --project=<ID>');
  console.log('\nUsage: node scripts/generate-notes.js --project=1 [--count=10] [--verbose|-v]');
  process.exit(1);
}

const db = new sqlite3.Database(path.resolve('db/database.sqlite'));

db.serialize(() => {
  // Check if project exists
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

    console.log(`\n📝 Generating ${count} fake notes for project ID ${projectId}...\n`);

    const stmt = db.prepare(`
      INSERT INTO notes (project_id, title, content)
      VALUES (?, ?, ?)
    `);

    for (let i = 0; i < count; i++) {
      const [projId, title, content] = generateNoteData(projectId);

      if (verbose) {
        console.log(`➕ ${title}`);
      }

      stmt.run(projId, title, content);
    }

    stmt.finalize(() => {
      console.log(`\n✅ Successfully inserted ${count} notes into project ${projectId}.\n`);
      db.close();
    });
  });
});
