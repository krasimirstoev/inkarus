// scripts/generate-drafts.js - Helper script to generate random drafts for Inkarus

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');
const generateDraftContent = require('../lib/generateDraftContent');
const { faker } = require('@faker-js/faker');

const db = new sqlite3.Database(path.resolve('db/database.sqlite'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function exitWithError(msg) {
  console.error('❌', msg);
  db.close();
  rl.close();
  process.exit(1);
}

async function main() {
  console.log('\n📝 Draft Generator for Inkarus');

  // 1. List all projects
  db.all(`SELECT id, title FROM projects ORDER BY id ASC`, async (err, projects) => {
    if (err) return exitWithError(err.message);
    if (!projects.length) return exitWithError('No projects found.');

    console.log('\n📚 Available Projects:');
    projects.forEach(p => console.log(`  - ${p.id}: ${p.title}`));

    const projectId = parseInt(await ask('\nEnter Project ID: '), 10);
    if (!projects.find(p => p.id === projectId)) return exitWithError('Invalid project ID.');

    // 2. List all parts in project
    db.all(`SELECT id, title FROM parts WHERE project_id = ? ORDER BY "order" ASC`, [projectId], async (err, parts) => {
      if (err) return exitWithError(err.message);
      if (!parts.length) return exitWithError('No parts found for this project.');

      console.log('\n🧩 Available Parts:');
      parts.forEach(p => console.log(`  - ${p.id}: ${p.title}`));

      const partId = parseInt(await ask('\nChoose Part ID to insert drafts into: '), 10);
      if (!parts.find(p => p.id === partId)) return exitWithError('Invalid Part ID.');

      // Fetch characters & locations
      db.all(`SELECT name, pseudonym FROM characters WHERE project_id = ?`, [projectId], async (err, characters) => {
        if (err) return exitWithError(err.message);
        const characterNames = characters.map(c => Math.random() > 0.5 && c.pseudonym ? c.pseudonym : c.name);
        const characterCount = characterNames.length;

        db.all(`SELECT name FROM locations WHERE project_id = ?`, [projectId], async (err, locations) => {
          if (err) return exitWithError(err.message);
          const locationNames = locations.map(l => l.name);
          const locationCount = locationNames.length;

          // Prompt with counts
          const charCount = parseInt(await ask(`How many characters should be mentioned (total out of ${characterCount}): `), 10);
          if (charCount > characterCount) return exitWithError(`❌ Cannot request ${charCount} characters, only ${characterCount} available.`);
            if (charCount < 0) return exitWithError('❌ Character count must be non-negative.');
            if (locationCount === 0) return exitWithError('❌ No locations available to mention.');
          const locCount = parseInt(await ask(`How many locations should be mentioned (total out of ${locationCount}): `), 10); 
          if (locCount > locationCount) return exitWithError(`❌ Cannot request ${locCount} locations, only ${locationCount} available.`);
            if (charCount < 0 || locCount < 0) return exitWithError('❌ Character and location counts must be non-negative.');  
            if (charCount === 0 && locCount === 0) return exitWithError('❌ At least one character or location must be mentioned.');
            if (charCount + locCount === 0) return exitWithError('❌ At least one character or location must be mentioned.');
          const paragraphCount = parseInt(await ask('How many paragraphs to generate: '), 10);

          // Title and content
          const title = faker.book.title(); // works in newer versions of faker (9.8+)
          const content = generateDraftContent(characterNames, locationNames, charCount, locCount, paragraphCount);

          // Determine next order
          db.get(`SELECT MAX("order") AS maxOrder FROM drafts WHERE part_id = ?`, [partId], (err, row) => {
            const nextOrder = (row?.maxOrder ?? -1) + 1;

            db.run(
              `INSERT INTO drafts (project_id, part_id, title, content, "order") VALUES (?, ?, ?, ?, ?)`,
              [projectId, partId, title, content, nextOrder],
              function (err) {
                if (err) return exitWithError(err.message);

                console.log(`\n✅ Draft inserted successfully (ID: ${this.lastID})`);
                db.close();
                rl.close();
              }
            );
          });
        });
      });
    });
  });
}

main();
