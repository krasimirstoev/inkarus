const db = require('../models/db');

/**
 * List all drafts for a project, grouped by parts (HTML view).
 * Also load rawParts for the parts‐CRUD modal.
 */
exports.list = (req, res) => {
  const { projectId } = req.params;

  // 1) Load all parts in order
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
      const grouped = [];

      // Once chapters grouped, load rawParts for modal and render
      const finish = () => {
        db.all(
          `SELECT id, title, "order"
             FROM parts
            WHERE project_id = ?
            ORDER BY "order"`,
          [projectId],
          (err2, rawParts) => {
            if (err2) {
              console.error('❌ DB error loading rawParts:', err2);
              return res.sendStatus(500);
            }
            res.render('drafts/list', {
              title:    'Drafts',
              parts:    grouped,
              rawParts,            // for inline CRUD in modal
              projectId
            });
          }
        );
      };

      // No parts → only Ungrouped
      if (remaining === 0) {
        db.all(
          `SELECT *
             FROM drafts
            WHERE project_id = ? AND part_id IS NULL
         ORDER BY "order"`,
          [projectId],
          (err3, drafts) => {
            if (err3) {
              console.error('❌ DB error loading ungrouped drafts:', err3);
              return res.sendStatus(500);
            }
            grouped.push({ id: null, title: 'Ungrouped', order: 0, chapters: drafts });
            finish();
          }
        );
      } else {
        // For each part, load its chapters
        parts.forEach(part => {
          db.all(
            `SELECT *
               FROM drafts
              WHERE project_id = ? AND part_id = ?
           ORDER BY "order"`,
            [projectId, part.id],
            (err4, drafts) => {
              if (err4) {
                console.error(`❌ DB error loading drafts for part ${part.id}:`, err4);
                return res.sendStatus(500);
              }
              grouped.push({
                id:       part.id,
                title:    part.title,
                order:    part.order,
                chapters: drafts
              });
              if (--remaining === 0) {
                // Then load ungrouped as final group
                db.all(
                  `SELECT *
                     FROM drafts
                    WHERE project_id = ? AND part_id IS NULL
                 ORDER BY "order"`,
                  [projectId],
                  (err5, draftsU) => {
                    if (err5) {
                      console.error('❌ DB error loading ungrouped drafts:', err5);
                      return res.sendStatus(500);
                    }
                    if (draftsU.length) {
                      grouped.push({
                        id:       null,
                        title:    'Ungrouped',
                        order:    Infinity,
                        chapters: draftsU
                      });
                    }
                    grouped.sort((a, b) => a.order - b.order);
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

/**
 * Return JSON array of all parts + their chapters for AJAX.
 */
exports.jsonGroups = (req, res) => {
  const { projectId } = req.params;
  db.all(
    `SELECT id, title, "order"
       FROM parts
      WHERE project_id = ?
      ORDER BY "order"`,
    [projectId],
    (err, parts) => {
      if (err) return res.sendStatus(500);
      let remaining = parts.length;
      const groups = [];

      const finishJson = () => {
        // After parts, include ungrouped drafts
        db.all(
          `SELECT *
             FROM drafts
            WHERE project_id = ? AND part_id IS NULL
         ORDER BY "order"`,
          [projectId],
          (errU, draftsU) => {
            if (errU) return res.sendStatus(500);
            if (draftsU.length) {
              groups.push({
                id:      null,
                title:   'Ungrouped',
                order:   Infinity,
                chapters:draftsU
              });
            }
            groups.sort((a, b) => a.order - b.order);
            res.json({ success: true, groups });
          }
        );
      };

      if (remaining === 0) {
        // No parts at all
        finishJson();
      } else {
        // Load drafts for each part
        parts.forEach(part => {
          db.all(
            `SELECT *
               FROM drafts 
              WHERE project_id = ? AND part_id = ?
           ORDER BY "order"`,
            [projectId, part.id],
            (errD, drafts) => {
              if (errD) return res.sendStatus(500);
              groups.push({
                id:      part.id,
                title:   part.title,
                order:   part.order,
                chapters:drafts
              });
              if (--remaining === 0) finishJson();
            }
          );
        });
      }
    }
  );
};

/**
 * Show editor for a single chapter.
 */
exports.edit = (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM drafts WHERE id = ?`, [id], (err, draft) => {
    if (err || !draft) return res.sendStatus(404);
    res.render('drafts/editor', { title: draft.title, draft });
  });
};

/**
 * Create a new chapter (optionally inside a part).
 */
exports.create = (req, res) => {
  const { projectId } = req.params;
  const { title, part_id } = req.body;
  db.run(
    `INSERT INTO drafts (project_id, title, part_id, "order")
         VALUES (?, ?, ?, COALESCE((
           SELECT MAX("order")+1 FROM drafts WHERE project_id = ?
         ), 0))`,
    [projectId, title, part_id || null, projectId],
    function(err) {
      if (err) {
        console.error('❌ Insert draft error:', err);
        return res.sendStatus(500);
      }
      res.redirect(`/drafts/${projectId}`);
    }
  );
};

/**
 * Autosave: update the content of a chapter.
 */
exports.update = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const isManual = req.body.manualSave === true || req.body.manualSave === 'true';
  const revisionType = isManual ? 'manual' : 'autosave';

  const wordCount = (content.trim().match(/\S+/g) || []).length;

  db.serialize(() => {
    db.get(`SELECT content FROM drafts WHERE id = ?`, [id], (err, row) => {
      if (err || !row) {
        console.error('❌ Error loading draft for revision:', err);
        return res.sendStatus(500);
      }

      const original = row.content;

      // Only if the content is edited
      if (original !== content) {
        db.run(`
          INSERT INTO draft_revisions (draft_id, content, word_count, type)
          VALUES (?, ?, ?, ?)`,
          [id, original, wordCount, revisionType]
        );
      }

      // Saving the new version
      db.run(`
        UPDATE drafts
        SET content = ?, last_saved = datetime('now')
        WHERE id = ?`,
        [content, id],
        err2 => {
          if (err2) {
            console.error('❌ Update draft error:', err2);
            return res.sendStatus(500);
          }
          res.json({ success: true, savedAt: new Date().toISOString() });
        }
      );
    });
  });
};


/**
 * Reorder a chapter within the same part: only updates its order.
 */
exports.reorder = (req, res) => {
  console.log('Reorder handler body:', req.body);
  const { id } = req.params;
  const order = parseInt(req.body.order, 10) || 0;

  db.run(
    `UPDATE drafts
        SET "order" = ?
      WHERE id = ?`,
    [order, id],
    err => {
      if (err) {
        console.error('❌ Reorder draft error:', err);
        return res.sendStatus(500);
      }
      res.json({ success: true });
    }
  );
};

/**
 * Move a chapter to another part and set its order.
 */
exports.move = (req, res) => {
  console.log('Move handler body:', req.body);
  const { id } = req.params;
  const partId = req.body.part_id === 'null' ? null : req.body.part_id;
  const order  = parseInt(req.body.order, 10) || 0;

  db.run(
    `UPDATE drafts
        SET part_id = ?, "order" = ?
      WHERE id = ?`,
    [partId, order, id],
    err => {
      if (err) {
        console.error('❌ Move draft error:', err);
        return res.sendStatus(500);
      }
      res.json({ success: true });
    }
  );
};

/**
 * Delete a chapter.
 */
exports.delete = (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM drafts WHERE id = ?`, [id], err => {
    if (err) {
      console.error('❌ Delete draft error:', err);
      return res.sendStatus(500);
    }
    if (req.xhr) return res.sendStatus(204);
    res.redirect('back');
  });
};

/**
 * Rename a chapter: update its title.
 */
exports.rename = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  db.run(
    `UPDATE drafts
        SET title = ?
      WHERE id = ?`,
    [title, id],
    err => {
      if (err) {
        console.error('❌ Rename draft error:', err);
        return res.sendStatus(500);
      }
      res.json({ success: true });
    }
  );
};

/**
 * Return JSON list of revisions for a given draft.
 */
exports.revisionsJson = (req, res) => {
  const { draftId } = req.params;

  db.all(
    `SELECT id, content, created_at, type
     FROM draft_revisions
     WHERE draft_id = ?
     ORDER BY created_at DESC`,
    [draftId],
    (err, rows) => {
      if (err) {
        console.error('❌ Error loading revisions:', err);
        return res.sendStatus(500);
      }

      // The next line is commented out for debugging purposes
      // Uncomment to log raw rows from the database
      //console.log('✅ Raw rows from DB:', rows);

      const result = rows.map(row => ({
        id: row.id,
        created_at: row.created_at,
        word_count: row.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
        type: row.type || 'unknown'
      }));

      res.json({ success: true, revisions: result });
    }
  );
};


