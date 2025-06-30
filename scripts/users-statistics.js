// scripts/users-statistics.js - Script to gather user statistics from the database

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

console.log('📊 Gathering user statistics...\n');

db.serialize(() => {
  db.all(`SELECT * FROM users`, [], async (err, users) => {
    if (err) {
      console.error('❌ Error fetching users:', err.message);
      return;
    }

    let globalWordCount = 0;

    for (const user of users) {
      console.log(`👤 User: ${user.username} (ID: ${user.id})`);
      console.log('----------------------------------------');

      const projects = await getAsync(`SELECT * FROM projects WHERE user_id = ?`, [user.id]);
      if (!projects.length) {
        console.log('  No projects.\n');
        continue;
      }

      for (const project of projects) {
        console.log(`📁 Project: ${project.title}`);

        let projectWordCount = 0;

        const parts = await getAsync(`SELECT * FROM parts WHERE project_id = ? ORDER BY "order" ASC`, [project.id]);

        for (const part of parts) {
          console.log(`  📄 Part: ${part.title}`);

          const drafts = await getAsync(`
            SELECT * FROM drafts WHERE part_id = ? ORDER BY "order" ASC
          `, [part.id]);

          if (drafts.length) {
            for (const draft of drafts) {
              const wordCount = countWords(draft.content || '');
              console.log(`    ✏ Draft: ${draft.title} (${wordCount} words)`);
              projectWordCount += wordCount;
            }
          } else {
            console.log(`    ✏ No drafts.`);
          }
        }

        console.log(`\n  🧮 Project total word count: ${projectWordCount} words`);

        const characters = await getAsync(`SELECT COUNT(*) AS count FROM characters WHERE project_id = ?`, [project.id]);
        console.log(`  🧙 Project has ${characters[0].count} character(s)`);

        const relations = await getAsync(`
          SELECT COUNT(*) AS count FROM character_relationships
          WHERE character_id IN (SELECT id FROM characters WHERE project_id = ?)
        `, [project.id]);
        console.log(`  🔗 Project has ${relations[0].count} character relationship(s)\n`);

        globalWordCount += projectWordCount;
      }

      console.log(`🧾 Total word count for user ${user.username}: ${globalWordCount} words\n`);
    }

    console.log(`✅ Global total word count across all users: ${globalWordCount} words`);
    db.close();
  });
});

function countWords(text) {
  return (text.match(/\b\w+\b/g) || []).length;
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
