const db = require('../models/db');

// List all drafts for a project, grouped by parts
exports.list = (req, res) => {
  const { projectId } = req.params;

  // 1) First load all parts for this project, in the desired order
  db.all(
    `SELECT id, title, "order"
       FROM parts
      WHERE project_id = ?
      ORDER BY "order"`,
    [projectId],
    (err, parts) => {
      if (err) {
        console.error('❌ DB error loading parts:', err);
        return res.sendStatus(500);
      }

      let remaining = parts.length;
      const result = [];

      const finish = () => {
        // Render view with parts array, each having its chapters
        res.render('drafts/list', {
          title: 'Drafts',
          parts: result,
          projectId
        });
      };

      if (remaining === 0) {
        // No parts defined → fall back to ungrouped drafts
        db.all(
          `SELECT *
             FROM drafts
            WHERE project_id = ?
              AND part_id IS NULL
         ORDER BY last_saved DESC`,
          [projectId],
          (err2, drafts) => {
            if (err2) {
              console.error('❌ DB error loading ungrouped drafts:', err2);
              return res.sendStatus(500);
            }
            result.push({
              id: null,
              title: 'Ungrouped (Chapters without Part)',
              order: 0,
              chapters: drafts
            });
            finish();
          }
        );
      } else {
        // Load chapters for each part
        parts.forEach(part => {
          db.all(
            `SELECT *
               FROM drafts
              WHERE project_id = ?
                AND part_id = ?
           ORDER BY last_saved DESC`,
            [projectId, part.id],
            (err3, drafts) => {
              if (err3) {
                console.error(`❌ DB error loading drafts for part ${part.id}:`, err3);
                return res.sendStatus(500);
              }
              result.push({
                id: part.id,
                title: part.title,
                order: part.order,
                chapters: drafts
              });
              if (--remaining === 0) {
                // Finally also grab any ungrouped drafts
                db.all(
                  `SELECT *
                     FROM drafts
                    WHERE project_id = ?
                      AND part_id IS NULL
                 ORDER BY last_saved DESC`,
                  [projectId],
                  (err4, ungrouped) => {
                    if (err4) {
                      console.error('❌ DB error loading ungrouped drafts:', err4);
                      return res.sendStatus(500);
                    }
                    if (ungrouped.length) {
                      result.push({
                        id: null,
                        title: 'Without part (ungrouped)',
                        order: Infinity,
                        chapters: ungrouped
                      });
                      // Sort the final array by 'order'
                      result.sort((a, b) => a.order - b.order);
                    }
                    finish();
                  }
                );
              }
            }
          );
        });
      }
    }
  );
};

// Show editor for a chapter
exports.edit = (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM drafts WHERE id = ?`, [id], (err, draft) => {
    if (err || !draft) return res.sendStatus(404);
    res.render('drafts/editor', { title: draft.title, draft });
  });
};

// Create new chapter, optionally inside a part
exports.create = (req, res) => {
  const { projectId } = req.params;
  const { title, part_id } = req.body;  // form must include `part_id`
  db.run(
    `INSERT INTO drafts (project_id, title, part_id) VALUES (?, ?, ?)`,
    [projectId, title, part_id || null],
    function (err) {
      if (err) {
        console.error('❌ Insert draft error:', err);
        return res.sendStatus(500);
      }
      res.redirect(`/drafts/${projectId}`);
    }
  );
};

// Update content of a draft (autosave)
exports.update = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  db.run(
    `UPDATE drafts
        SET content = ?, last_saved = datetime('now')
      WHERE id = ?`,
    [content, id],
    err => {
      if (err) {
        console.error('❌ Update draft error:', err);
        return res.sendStatus(500);
      }
      res.json({ success: true, savedAt: new Date().toISOString() });
    }
  );
};
