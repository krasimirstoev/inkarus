const db = require('../models/db');

// List all parts for a given project (HTML view)
exports.list = (req, res) => {
  const { projectId } = req.params;
  db.all(
    `SELECT id, title, "order"
       FROM parts
      WHERE project_id = ?
      ORDER BY "order"`,
    [projectId],
    (err, parts) => {
      if (err) {
        console.error('❌ DB error in parts.list:', err);
        return res.sendStatus(500);
      }
      // Render parts management page
      res.render('parts/list', { title: 'Parts', parts, projectId });
    }
  );
};

// Return JSON array of parts for sidebar or AJAX
exports.jsonList = (req, res) => {
  const { projectId } = req.params;
  db.all(
    `SELECT id, title, "order"
       FROM parts
      WHERE project_id = ?
      ORDER BY "order"`,
    [projectId],
    (err, parts) => {
      if (err) {
        console.error('❌ DB error in parts.jsonList:', err);
        return res.json({ success: false });
      }
      res.json({ success: true, parts });
    }
  );
};

// Show form for creating a new part or editing an existing one
exports.form = (req, res) => {
  const { projectId, id } = req.params;
  if (!id) {
    // New part
    return res.render('parts/form', {
      title: 'New Part',
      part: null,
      projectId
    });
  }
  // Edit existing part
  db.get(
    `SELECT id, title, "order"
       FROM parts
      WHERE id = ?`,
    [id],
    (err, part) => {
      if (err || !part) {
        console.error('❌ DB error in parts.form:', err);
        return res.sendStatus(404);
      }
      res.render('parts/form', {
        title: 'Edit Part',
        part,
        projectId
      });
    }
  );
};

// Save a part: create or update, then redirect back to parts list
exports.save = (req, res) => {
  const { projectId, id } = req.params;
  const { title, order } = req.body;
  const parsedOrder = parseInt(order, 10) || 0;

  if (id) {
    // UPDATE: detect if title was provided
    if (typeof title === 'undefined') {
      // Only reorder
      db.run(
        `UPDATE parts
            SET "order" = ?
          WHERE id = ?`,
        [parsedOrder, id],
        function (err) {
          if (err) {
            console.error('❌ DB error in parts.save (reorder):', err);
            return res.sendStatus(500);
          }
          // For AJAX reorder we don't need to redirect
          return res.json({ success: true });
        }
      );
    } else {
      // Update title and order
      db.run(
        `UPDATE parts
            SET title = ?, "order" = ?
          WHERE id = ?`,
        [title, parsedOrder, id],
        function (err) {
          if (err) {
            console.error('❌ DB error in parts.save (update):', err);
            return res.sendStatus(500);
          }
          res.redirect(`/parts/${projectId}`);
        }
      );
    }
  } else {
    // Insert new
    db.run(
      `INSERT INTO parts (project_id, title, "order")
           VALUES (?, ?, ?)`,
      [projectId, title, parsedOrder],
      function (err) {
        if (err) {
          console.error('❌ DB error in parts.save (insert):', err);
          return res.sendStatus(500);
        }
        res.redirect(`/parts/${projectId}`);
      }
    );
  }
};

// Delete a part and unset its chapters’ part_id
exports.delete = (req, res) => {
    const { id } = req.params;
    // First detach any drafts in this part
    db.run(
      `UPDATE drafts
          SET part_id = NULL
        WHERE part_id = ?`,
      [id],
      err1 => {
        if (err1) console.warn('⚠ Failed to detach drafts from part:', err1);
        // Then delete the part itself
        db.run(
          `DELETE FROM parts WHERE id = ?`,
          [id],
          err2 => {
            if (err2) {
              console.error('❌ DB error in parts.delete:', err2);
              // If AJAX, send JSON error
              if (req.xhr || req.method === 'DELETE') {
                return res.status(500).json({ success: false });
              }
              return res.sendStatus(500);
            }
            // If AJAX (DELETE), respond JSON
            if (req.xhr || req.method === 'DELETE') {
              return res.json({ success: true });
            }
            // Otherwise do normal redirect
            res.redirect('back');
          }
        );
      }
    );
  };

/**
 * Render only the form for AJAX modal (no layout).
 */
exports.modalForm = (req, res) => {
  const { projectId, id } = req.params;
  if (!id) {
    // new part form
    return res.render('parts/modalForm', {
      projectId,
      part: null,
      layout: false
    });
  }
  // edit existing part
  db.get(
    `SELECT id, title, "order"
       FROM parts
      WHERE id = ?`,
    [id],
    (err, part) => {
      if (err || !part) return res.sendStatus(404);
      res.render('parts/modalForm', {
        projectId,
        part,
        layout: false
      });
    }
  );
};