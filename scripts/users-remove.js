// scripts/users-remove.js
// CLI: Remove a user and all their related data (projects, drafts, notes, etc.)

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

const args = require('minimist')(process.argv.slice(2));
const username = args.username;

if (!username) {
  console.log('\n❗ Usage: node scripts/users-remove.js --username=example');
  process.exit(1);
}

db.serialize(() => {
  db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) {
      console.error('❌ Database error:', err.message);
      return db.close();
    }

    if (!user) {
      console.log(`ℹ️  User "${username}" not found.`);
      return db.close();
    }

    const userId = user.id;

    // 1. Get project IDs
    db.all(`SELECT id FROM projects WHERE user_id = ?`, [userId], (err, projects) => {
      if (err) {
        console.error('❌ Failed to get projects:', err.message);
        return db.close();
      }

      const projectIds = projects.map(p => p.id);

      // 2. Delete everything linked to these projects
      db.run(`DELETE FROM preferences WHERE user_id = ?`, [userId]);
      db.run(`DELETE FROM characters WHERE project_id IN (${projectIds.join(',') || 0})`);
      db.run(`DELETE FROM notes WHERE project_id IN (${projectIds.join(',') || 0})`);
      db.run(`DELETE FROM locations WHERE project_id IN (${projectIds.join(',') || 0})`);
      db.run(`DELETE FROM events WHERE project_id IN (${projectIds.join(',') || 0})`);
      db.run(`DELETE FROM parts WHERE project_id IN (${projectIds.join(',') || 0})`);
      db.run(`DELETE FROM drafts WHERE project_id IN (${projectIds.join(',') || 0})`);
      db.run(`DELETE FROM draft_revisions WHERE draft_id IN (
        SELECT id FROM drafts WHERE project_id IN (${projectIds.join(',') || 0})
      )`);
      db.run(`DELETE FROM projects WHERE user_id = ?`, [userId]);

      // 3. Delete user and their preferences
      db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
        if (err) {
          console.error('❌ Failed to delete user:', err.message);
        } else {
          console.log(`✅ User "${username}" and all related data were removed.`);
        }
        db.close();
      });
    });
  });
});
