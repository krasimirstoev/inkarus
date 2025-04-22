const db = require('../models/db');

// List all drafts for a project
exports.list = (req, res) => {
  const { projectId } = req.params;

  db.all(`SELECT * FROM drafts WHERE project_id = ?`, [projectId], (err, drafts) => {
    if (err) return res.sendStatus(500);
    res.render('drafts/list', { title: 'Drafts', drafts, projectId });
  });
};

// Show editor for a draft
exports.edit = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM drafts WHERE id = ?`, [id], (err, draft) => {
    if (err || !draft) return res.sendStatus(404);
    res.render('drafts/editor', { title: draft.title, draft });
  });
};

// Create new draft
exports.create = (req, res) => {
  const { projectId } = req.params;
  const { title } = req.body;

  db.run(`INSERT INTO drafts (project_id, title) VALUES (?, ?)`, [projectId, title], function (err) {
    if (err) return res.sendStatus(500);
    res.redirect(`/drafts/${projectId}`);
  });
};

// Update content of a draft (autosave)
exports.update = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  db.run(`UPDATE drafts SET content = ?, last_saved = datetime('now') WHERE id = ?`, [content, id], (err) => {
    if (err) return res.sendStatus(500);
    res.json({ success: true, savedAt: new Date().toISOString() });
  });
};
