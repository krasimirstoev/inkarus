// scripts/generate-relationships.js - Helper script to generate random character relationships in Inkarus

// Usage: node scripts/generate-relationships.js --project=<ID> [--count=10] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const relationshipTypes = require('../lib/relationshipTypes');

// Parse CLI arguments
const args       = process.argv.slice(2);
const countArg   = args.find(arg => arg.startsWith('--count='));
const projectArg = args.find(arg => arg.startsWith('--project='));
const verbose    = args.includes('--verbose') || args.includes('-v');

const count     = countArg ? parseInt(countArg.split('=')[1], 10) : 5;
const projectId = projectArg ? parseInt(projectArg.split('=')[1], 10) : null;

if (!projectId || isNaN(projectId)) {
  console.error('❌ Missing required argument: --project=<ID>');
  console.log('\nUsage: node scripts/generate-relationships.js --project=1 [--count=10] [--verbose|-v]');
  process.exit(1);
}

const db = new sqlite3.Database(path.resolve('db/database.sqlite'));

db.serialize(() => {
  // Fetch all characters for the given project
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

      let inserted = 0;
      const usedPairs = new Set();

      // Attempt to insert relationships until count is reached
      function tryNext() {
        if (inserted >= count) {
          console.log(`\n✅ Successfully inserted ${inserted} relationships into project ${projectId}.\n`);
          db.close();
          return;
        }

        // Pick two distinct random characters
        const charA = characters[Math.floor(Math.random() * characters.length)];
        const charB = characters[Math.floor(Math.random() * characters.length)];
        if (charA.id === charB.id) return tryNext();

        const keyAB = `${charA.id}-${charB.id}`;
        const keyBA = `${charB.id}-${charA.id}`;
        if (usedPairs.has(keyAB) || usedPairs.has(keyBA)) return tryNext();

        // Check if any relationship already exists in either direction
        db.get(
          `SELECT 1 FROM character_relationships 
           WHERE (character_id = ? AND related_character_id = ?)
              OR (character_id = ? AND related_character_id = ?)`,
          [charA.id, charB.id, charB.id, charA.id],
          (checkErr, row) => {
            if (checkErr) {
              console.error('❌ Failed to check existing relationships:', checkErr.message);
              return tryNext();
            }
            if (row) {
              usedPairs.add(keyAB);
              return tryNext();
            }

            // Pick a random relationship type
            const rel = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];

            // Insert single-direction relationship only
            db.run(
              `INSERT INTO character_relationships (character_id, related_character_id, relation)
               VALUES (?, ?, ?)`,
              [charA.id, charB.id, rel.relation],
              function (insertErr) {
                if (insertErr) {
                  console.error('❌ Insert failed:', insertErr.message);
                  return tryNext();
                }

                if (verbose) {
                  console.log(`🔗 ${charA.name} → ${rel.relation} → ${charB.name}`);
                }

                usedPairs.add(keyAB);
                inserted++;
                tryNext();
              }
            );
          }
        );
      }

      tryNext(); // Start generating relationships
    }
  );
});
