// scripts/generate-relationships.js - Helper script to generate fake relationships between characters
// Usage: node scripts/generate-relationships.js --project=<ID> [--count=10] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const relationshipTypes = require('../lib/relationshipTypes');

// Parse CLI arguments
const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const projectArg = args.find(arg => arg.startsWith('--project='));
const verbose = args.includes('--verbose') || args.includes('-v');

const count = countArg ? parseInt(countArg.split('=')[1], 10) : 5;
const projectId = projectArg ? parseInt(projectArg.split('=')[1], 10) : null;

if (!projectId || isNaN(projectId)) {
  console.error('❌ Missing required argument: --project=<ID>');
  console.log('\nUsage: node scripts/generate-relationships.js --project=1 [--count=10] [--verbose|-v]');
  process.exit(1);
}

const db = new sqlite3.Database(path.resolve('db/database.sqlite'));

db.serialize(() => {
  // Fetch characters for the project
  db.all(
    `SELECT id, name FROM characters WHERE project_id = ?`,
    [projectId],
    (err, characters) => {
      if (err) {
        console.error('❌ Failed to fetch characters:', err.message);
        db.close();
        process.exit(1);
      }

      if (characters.length < 2) {
        console.error('⚠️  Not enough characters to generate relationships.');
        db.close();
        process.exit(1);
      }

      const stmt = db.prepare(`
        INSERT INTO character_relationships (character_id, related_character_id, relation)
        VALUES (?, ?, ?)
      `);

      let inserted = 0;
      const usedPairs = new Set();

      while (inserted < count) {
        const charA = characters[Math.floor(Math.random() * characters.length)];
        const charB = characters[Math.floor(Math.random() * characters.length)];

        if (charA.id === charB.id) continue;

        const pairKey = `${charA.id}-${charB.id}`;
        const reverseKey = `${charB.id}-${charA.id}`;
        if (usedPairs.has(pairKey) || usedPairs.has(reverseKey)) continue;

        const rel = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
        usedPairs.add(pairKey);

        stmt.run(charA.id, charB.id, rel.relation);
        if (rel.inverse) {
          stmt.run(charB.id, charA.id, rel.inverse);
        }

        if (verbose) {
          console.log(`🔗 ${charA.name} → ${rel.relation} → ${charB.name}`);
          if (rel.inverse && rel.inverse !== rel.relation) {
            console.log(`🔁 ${charB.name} → ${rel.inverse} → ${charA.name}`);
          }
        }

        inserted++;
      }

      stmt.finalize(() => {
        console.log(`\n✅ Successfully inserted ${inserted} relationships into project ${projectId}.\n`);
        db.close();
      });
    }
  );
});
