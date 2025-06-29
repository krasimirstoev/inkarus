// scripts/generate-events.js - Helper script to generate events for a project in the Inkarus
// Usage: node scripts/generate-events.js --project=<ID> --is_abstract=yes|no [--count=5] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { faker } = require('@faker-js/faker');
const generateEventData = require('../lib/generateEventData');

// Parse arguments
const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const projectArg = args.find(arg => arg.startsWith('--project='));
const abstractArg = args.find(arg => arg.startsWith('--is_abstract='));
const verbose = args.includes('--verbose') || args.includes('-v');

const count = countArg ? parseInt(countArg.split('=')[1], 10) : 5;
const projectId = projectArg ? parseInt(projectArg.split('=')[1], 10) : null;

if (!projectId || isNaN(projectId)) {
  console.error('❌ Missing required argument: --project=<ID>');
  process.exit(1);
}

if (!abstractArg) {
  console.error('❌ Missing required argument: --is_abstract=yes|no');
  process.exit(1);
}

const abstractValue = abstractArg.split('=')[1];
if (!['yes', 'no'].includes(abstractValue)) {
  console.error('❌ Invalid value for --is_abstract. Use "yes" or "no".');
  process.exit(1);
}

const isAbstract = abstractValue === 'yes';

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

    console.log(`\n📅 Generating ${count} ${isAbstract ? 'abstract' : 'dated'} events for project ID ${projectId}...\n`);

    const stmt = db.prepare(`
      INSERT INTO events (
        project_id,
        title,
        description,
        event_date,
        is_abstract,
        display_order
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const usedDisplayOrders = new Set();

    for (let i = 0; i < count; i++) {
      let displayOrder = 0;

      if (isAbstract) {
        // Generate unique display_order between 0 and count-1
        do {
          displayOrder = faker.number.int({ min: 0, max: count - 1 });
        } while (usedDisplayOrders.has(displayOrder));
        usedDisplayOrders.add(displayOrder);
      }

      const values = generateEventData(projectId, isAbstract, isAbstract ? displayOrder : null);

      if (verbose) {
        console.log(`➕ ${values[1]} (${isAbstract ? values[3] : 'date: ' + values[3]})`);
      }

      stmt.run(values);
    }

    stmt.finalize(() => {
      console.log(`\n✅ Successfully inserted ${count} events into project ${projectId}.\n`);
      db.close();
    });
  });
});
