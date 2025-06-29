// scripts/generate-characters.js - Helper script to generate fake characters for a project in the Inkarus app
// Usage: node scripts/generate-characters.js --project=<ID> [--count=10] [--verbose|-v]

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { faker } = require('@faker-js/faker');

// Parse arguments
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

    console.log(`\n👤 Generating ${count} fake characters for project ID ${projectId}...\n`);

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
      const name = faker.person.fullName();
      const pseudonym = faker.hacker.adjective() + ' ' + faker.animal.type();
      const description = faker.lorem.paragraph();
      const birthdate = faker.date.birthdate({ min: 18, max: 70, mode: 'age' }).toISOString().split('T')[0];
      const gender = faker.helpers.arrayElement(['male', 'female', 'non-binary']);
      const origin = faker.location.city();
      const location = faker.location.country();
      const occupation = faker.person.jobTitle();
      const health_status = faker.helpers.arrayElement(['healthy', 'injured', 'sick']);
      const comment = faker.lorem.sentence();
      const goal = faker.lorem.sentence();
      const character_type = faker.helpers.arrayElement(['main', 'supporting', 'antagonist']);
      const motivation = faker.lorem.words(5);
      const fears = faker.lorem.words(3);
      const weaknesses = faker.lorem.words(4);
      const arc = faker.word.adjective();
      const secrets = faker.word.noun() + ', ' + faker.word.noun();
      const allies = faker.person.firstName() + ', ' + faker.person.firstName();
      const enemies = faker.person.firstName();

      if (verbose) {
        console.log(`➕ ${name} (${pseudonym})`);
      }

      stmt.run(
        projectId,
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
      );
    }

    stmt.finalize(() => {
      console.log(`\n✅ Successfully inserted ${count} characters into project ${projectId}.\n`);
      db.close();
    });
  });
});
