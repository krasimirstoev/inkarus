// scripts/check-schema.js - Helper script to check the SQLite database schema for the Inkarus app
// Usage: node scripts/check-schema.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to database
const DB_PATH = path.resolve('db/database.sqlite');

// Expected tables and their columns
const expectedSchema = {
  projects: ['id', 'user_id', 'title', 'description'],
  parts: ['id', 'project_id', 'title', 'order'],
  drafts: ['id', 'project_id', 'part_id', 'title', 'content', 'order', 'last_saved', 'created_at', 'updated_at'],
  notes: ['id', 'project_id', 'title', 'content'],
  characters: ['id', 'project_id', 'name', 'pseudonym', 'description', 'birthdate', 'gender', 'origin', 'location', 'occupation', 'health_status', 'comment', 'goal',
    'character_type', 'motivation', 'fears', 'weaknesses', 'arc', 'secrets', 'allies', 'enemies', 'created_at', 'updated_at'],
  health_history: ['id', 'character_id', 'event', 'date'],
  character_relationships: ['id', 'character_id', 'related_character_id', 'relation'],
  preferences: ['id', 'user_id', 'autosave_interval', 'show_status_bar', 'font_choice'],
  draft_revisions: ['id', 'draft_id', 'content', 'word_count', 'type', 'created_at'],
  users: ['id', 'username', 'password', 'email'],
  locations: ['id', 'project_id', 'name', 'description', 'type', 'custom_type', 'created_at', 'updated_at'],
  events: ['id', 'project_id', 'title', 'description', 'event_date', 'is_abstract', 'display_order', 'created_at', 'updated_at']
};

// Expected indexes
const expectedIndexes = [
  { name: 'idx_drafts_project_id', table: 'drafts' },
  { name: 'idx_notes_project_id', table: 'notes' },
  { name: 'idx_characters_project_id', table: 'characters' },
  { name: 'idx_events_project_id', table: 'events' }
];

// Check schema
function checkSchema(db) {
  console.log('\n🧪 Checking SQLite schema...\n');

  db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
    if (err) {
      console.error('❌ Failed to read tables:', err);
      process.exit(1);
    }

    const tableNames = tables.map(t => t.name);
    let hasError = false;

    console.log('📄 Table structure check:');

    let pending = Object.entries(expectedSchema).length;

    for (const [table, expectedColumns] of Object.entries(expectedSchema)) {
      if (!tableNames.includes(table)) {
        console.error(`❌ Missing table: ${table}`);
        hasError = true;
        if (--pending === 0) return checkIndexes(db, hasError);
        continue;
      }

      db.all(`PRAGMA table_info(${table})`, [], (err2, columns) => {
        if (err2) {
          console.error(`❌ Failed to read columns of ${table}:`, err2);
          hasError = true;
          if (--pending === 0) return checkIndexes(db, hasError);
          return;
        }

        const actualColumns = columns.map(col => col.name);
        const missingCols = expectedColumns.filter(c => !actualColumns.includes(c));
        const extraCols = actualColumns.filter(c => !expectedColumns.includes(c));

        if (missingCols.length > 0) {
          console.warn(`⚠️  ${table}: Missing columns →`, missingCols.join(', '));
          hasError = true;
        } else {
          console.log(`✅ ${table} – all expected columns are present.`);
        }

        if (extraCols.length > 0) {
          console.info(`ℹ️  ${table}: Extra columns →`, extraCols.join(', '));
        }

        if (--pending === 0) {
          checkIndexes(db, hasError);
        }
      });
    }
  });
}

function checkIndexes(db, hasError) {
  console.log('\n📊 Index check:');

  db.all(`SELECT name FROM sqlite_master WHERE type='index'`, [], (err3, indexes) => {
    if (err3) {
      console.error('❌ Failed to read indexes:', err3);
      process.exit(1);
    }

    const indexNames = indexes.map(i => i.name);

    for (const { name, table } of expectedIndexes) {
      if (!indexNames.includes(name)) {
        console.error(`❌ Missing index: ${name} (table: ${table})`);
        hasError = true;
      } else {
        console.log(`✅ Found index: ${name}`);
      }
    }

    console.log('\n✔️  Schema check completed.\n');
    process.exit(hasError ? 1 : 0);
  });
}

// Start
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Could not open database:', err.message);
    process.exit(1);
  }

  checkSchema(db);
});

// Close DB connection
process.on('exit', () => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed.');
    }
  });
});
