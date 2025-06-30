// scripts/check-orphans.js - Helper script to check and clean orphaned records in the Inkarus database


// Usage: node scripts/check-orphans.js --justcheck
//     or: node scripts/check-orphans --cleanup

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Parse CLI args
const mode = process.argv[2];

if (!['--justcheck', '--cleanup'].includes(mode)) {
  console.log(`❌ Invalid usage.

Usage:
  node scripts/orphan-checker.js --justcheck   # only show orphaned data
  node scripts/orphan-checker.js --cleanup     # delete orphaned data

`);
  process.exit(1);
}

// Utility to run a single SQL statement with optional params
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Utility to get data from SQL
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

(async () => {
  console.log(`🔍 Running orphan check in ${mode === '--cleanup' ? 'cleanup' : 'read-only'} mode...\n`);

  // Config of checks: table, reference column, reference table
  const checks = [
    {
      table: 'parts',
      column: 'project_id',
      refTable: 'projects',
      refColumn: 'id',
    },
    {
      table: 'drafts',
      column: 'project_id',
      refTable: 'projects',
      refColumn: 'id',
    },
    {
      table: 'drafts',
      column: 'part_id',
      refTable: 'parts',
      refColumn: 'id',
    },
    {
      table: 'notes',
      column: 'project_id',
      refTable: 'projects',
      refColumn: 'id',
    },
    {
      table: 'characters',
      column: 'project_id',
      refTable: 'projects',
      refColumn: 'id',
    },
    {
      table: 'health_history',
      column: 'character_id',
      refTable: 'characters',
      refColumn: 'id',
    },
    {
      table: 'character_relationships',
      column: 'character_id',
      refTable: 'characters',
      refColumn: 'id',
    },
    {
      table: 'character_relationships',
      column: 'related_character_id',
      refTable: 'characters',
      refColumn: 'id',
    },
    {
      table: 'preferences',
      column: 'user_id',
      refTable: 'users',
      refColumn: 'id',
    },
    {
      table: 'draft_revisions',
      column: 'draft_id',
      refTable: 'drafts',
      refColumn: 'id',
    },
    {
      table: 'locations',
      column: 'project_id',
      refTable: 'projects',
      refColumn: 'id',
    },
    {
      table: 'events',
      column: 'project_id',
      refTable: 'projects',
      refColumn: 'id',
    }
  ];

  for (const check of checks) {
    const { table, column, refTable, refColumn } = check;

    const orphaned = await getAsync(`
      SELECT ${table}.id FROM ${table}
      LEFT JOIN ${refTable} ON ${table}.${column} = ${refTable}.${refColumn}
      WHERE ${refTable}.${refColumn} IS NULL
    `);

    if (orphaned.length > 0) {
      console.log(`⚠️  ${table}: Found ${orphaned.length} orphaned records (missing ${refTable}.${refColumn})`);

      if (mode === '--cleanup') {
        const ids = orphaned.map(r => r.id);
        await runAsync(`DELETE FROM ${table} WHERE id IN (${ids.join(',')})`);
        console.log(`   🧹 Deleted ${ids.length} orphaned record(s)`);
      }
    }
  }

  console.log(`\n✅ Done.`);
  db.close();
})();
