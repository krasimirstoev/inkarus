// scripts/check-db-size.js - Helper script to estimate SQLite table sizes

// Usage: node scripts/check-db-size.js
// This script estimates the size of each table in the Inkarus SQLite database
// by calculating the total byte size of specified columns. It provides a
// summary of the number of rows and size in MB/KB for each table.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Define which tables and columns to analyze
const TABLES = {
  projects: ['title', 'description'],
  parts: ['title'],
  drafts: ['title', 'content'],
  notes: ['title', 'content'],
  characters: ['name', 'pseudonym', 'description', 'origin', 'location', 'occupation', 'health_status', 'comment', 'goal', 'motivation', 'fears', 'weaknesses', 'arc', 'secrets', 'allies', 'enemies'],
  health_history: ['event'],
  character_relationships: ['relation'],
  preferences: [], // ignored
  draft_revisions: ['content'],
  users: ['username', 'email'],
  locations: ['name', 'description', 'type', 'custom_type'],
  events: ['title', 'description', 'event_date'],
};

function analyzeTable(table, columns) {
  return new Promise((resolve, reject) => {
    if (!columns.length) return resolve(null); // skip tables with no analyzable columns

    const sizeExpr = columns.map(col => `LENGTH(${col})`).join(' + ');
    const sql = `SELECT COUNT(*) as count, SUM(${sizeExpr}) as total_bytes FROM ${table}`;

    db.get(sql, (err, row) => {
      if (err) return reject(err);
      const bytes = row.total_bytes || 0;
      resolve({
        table,
        rows: row.count,
        bytes,
        mb: (bytes / 1024 / 1024).toFixed(2),
        kb: (bytes / 1024).toFixed(2)
      });
    });
  });
}

async function main() {
  console.log('📊 Estimating table sizes...\n');

  const results = [];
  let totalBytes = 0;

  for (const [table, columns] of Object.entries(TABLES)) {
    try {
      const result = await analyzeTable(table, columns);
      if (!result) continue;
      results.push(result);
      totalBytes += result.bytes;
    } catch (err) {
      console.error(`❌ Error analyzing ${table}:`, err.message);
    }
  }

  results.sort((a, b) => b.bytes - a.bytes);

  // Headers
  const tableHeader = 'Table'.padEnd(24);
  const rowsHeader = 'Rows'.padStart(6);
  const sizeHeader = 'Size (MB / KB)';
  console.log(`${tableHeader}${rowsHeader}  ${sizeHeader}`);
  console.log('---------------------------------------------');

  // Table output
  for (const { table, rows, mb, kb } of results) {
    const tableName = table.padEnd(24);
    const rowCount = rows.toString().padStart(6);
    console.log(`${tableName}${rowCount}  ${mb} MB / ${kb} KB`);
  }

  const totalMb = (totalBytes / 1024 / 1024).toFixed(2);
  const totalKb = (totalBytes / 1024).toFixed(2);

  console.log('\n📦 Total estimated size:');
  console.log(`➡️  ${totalMb} MB / ${totalKb} KB`);
  db.close();
}

main();
