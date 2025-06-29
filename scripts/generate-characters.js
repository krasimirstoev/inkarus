// scripts/generate-characters.js - Helper script to generate fake characters for a project in the Inkarus app
// Usage: node scripts/generate-characters.js --project=<ID> [--count=10] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const generateCharacterData = require('../lib/generateCharacterData');

// Parse CLI args
const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const projectArg = args.find(arg => arg.startsWith('--project='));
const verbose = args.includes('--verbose') || args.includes('-v');

const count = countArg ? parseInt(countArg.split('=')[1], 10) : 5;
const projectId = projectArg ? parseInt(projectArg.split('=')[1], 10) : null;

if (!projectId || isNaN(projectId)) {
  console.error('❌ Missing required argument: --project=<ID>');
  console.log('\nUsage: node scripts/generate-characters.js --project=1 [--count=10] [--verbose|-v]');
  process.exit(1);
}

// Open DB
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

    console.log(`\n👤 Generating ${count} character(s) for project ID ${projectId}...\n`);

    const stmt = db.prepare(`
      INSERT INTO characters (
        project_id,
        name,
        pseudonym,
        description,
        birthdate,
        gender,
        origin,
        location,
        occupation,
        health_status,
        comment,
        goal,
        character_type,
        motivation,
        fears,
        weaknesses,
        arc,
        secrets,
        allies,
        enemies
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < count; i++) {
      const characterData = generateCharacterData(projectId);
      if (verbose) {
        console.log(`➕ ${characterData[1]} (${characterData[2]})`);
      }
      stmt.run(characterData);
    }

    stmt.finalize(() => {
      console.log(`\n✅ Successfully inserted ${count} character(s) into project ${projectId}.\n`);
      db.close();
    });
  });
});
