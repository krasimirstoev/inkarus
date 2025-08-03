// controllers/noteController.js - Controller for managing notes in a project

const db = require('../models/db');

// List notes in view
exports.list = (req, res) => {
  const { projectId } = req.params;

  db.all(`SELECT * FROM notes WHERE project_id = ?`, [projectId], (err, notes) => {
    if (err) {
      console.error('❌ DB error in list:', err);
      return res.sendStatus(500);
    }

    res.render('notes/list', { title: res.__('Notes.List.title'), notes, projectId });
  });
};

// JSON API for notes (used by frontend panel)
exports.listJson = (req, res) => {
  const { projectId } = req.params;

  db.all(
    `SELECT id, title, content FROM notes WHERE project_id = ? ORDER BY id DESC`,
    [projectId],
    (err, notes) => {
      if (err) {
        console.error('❌ DB error in listJson:', err);
        return res.json({ success: false });
      }

      res.json({ success: true, notes });
    }
  );
};

// Show form to create/edit a note
exports.form = (req, res) => {
  const { id, projectId } = req.params;

  if (!id) {
    return res.render('notes/form', {
      title: res.__('Notes.Form.new_title'),
      note: null,
      projectId,
    });
  }

  db.get(`SELECT * FROM notes WHERE id = ?`, [id], (err, note) => {
    if (err || !note) {
      console.error('❌ DB error in form or note not found:', err);
      return res.sendStatus(404);
    }

    res.render('notes/form', {
      title: res.__('Notes.Form.edit_title'),
      note,
      projectId,
    });
  });
};

// Save note (HTML or AJAX)
exports.save = (req, res) => {
  const { projectId, id } = req.params;
  const { title, content } = req.body;

  const isJson = req.is('application/json') || req.headers.accept?.includes('application/json');

  if (!title?.trim() && !content?.trim()) {
    console.warn('⚠ Attempted to save empty note, ignoring.');
    return isJson
      ? res.status(400).json({ success: false, message: req.__('Notes.Errors.empty_note_not_allowed') })
      : res.redirect(`/notes/${projectId}`);
  }

  if (id) {
    db.run(
      `UPDATE notes SET title = ?, content = ? WHERE id = ?`,
      [title, content, id],
      function (err) {
        if (err) {
          console.error('❌ DB error in update:', err);
          return isJson ? res.status(500).json({ success: false }) : res.sendStatus(500);
        }

        if (this.changes === 0) {
          return isJson
            ? res.status(404).json({ success: false, message: req.__('Notes.Errors.not_found') })
            : res.sendStatus(404);
        }

        return isJson ? res.json({ success: true }) : res.redirect(`/notes/${projectId}`);
      }
    );
  } else {
    db.run(
      `INSERT INTO notes (project_id, title, content) VALUES (?, ?, ?)`,
      [projectId, title, content],
      function (err) {
        if (err) {
          console.error('❌ DB error in insert:', err);
          return isJson ? res.status(500).json({ success: false }) : res.sendStatus(500);
        }

        return isJson
          ? res.json({ success: true, id: this.lastID })
          : res.redirect(`/notes/${projectId}`);
      }
    );
  }
};

// Delete note (HTML or AJAX)
exports.delete = (req, res) => {
  const { id } = req.params;
  const isJson = req.is('application/json') || req.headers.accept?.includes('application/json');

  db.run(`DELETE FROM notes WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('❌ DB error in delete:', err);
      return isJson ? res.status(500).json({ success: false }) : res.sendStatus(500);
    }

    if (this.changes === 0) {
      console.warn('⚠ Note ID not found:', id);
      return isJson
        ? res.status(404).json({ success: false, message: 'Note not found' })
        : res.sendStatus(404);
    }

    console.log('🗑 Note deleted:', id);
    return isJson
      ? res.json({ success: true })
      : res.redirect(req.get('Referrer') || '/');
  });
};
