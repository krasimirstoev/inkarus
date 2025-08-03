// controllers/projectController.js - This file handles project-related actions

const db = require('../models/db');

// Show all projects for the logged-in user
exports.list = (req, res) => {
  const userId = req.session.user.id;

  db.all(`SELECT * FROM projects WHERE user_id = ?`, [userId], (err, projects) => {
    if (err) return res.sendStatus(500);
    res.render('projects/index', { title: res.__('Projects.List.title'), projects });
  });
};

// Show form to create a new project
exports.newForm = (req, res) => {
  res.render('projects/form', { title: res.__('Projects.Form.new_title') });
};

// Create new project
exports.create = (req, res) => {
  const userId = req.session.user.id;
  const { title, description } = req.body;

  db.run(`INSERT INTO projects (user_id, title, description) VALUES (?, ?, ?)`,
    [userId, title, description],
    function (err) {
      if (err) return res.sendStatus(500);
      res.redirect('/projects');
    });
};

// Show dashboard for a specific project
exports.dashboard = (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.id;

  db.get(`SELECT * FROM projects WHERE id = ? AND user_id = ?`, [id, userId], (err, project) => {
    if (err || !project) return res.sendStatus(404);
    res.render('projects/dashboard', { title: res.__('Projects.Dashboard.title'), project });
  });
};

// Show edit form
exports.editForm = (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.id;

  db.get(`SELECT * FROM projects WHERE id = ? AND user_id = ?`, [id, userId], (err, project) => {
    if (err || !project) return res.sendStatus(404);
    res.render('projects/edit', { title: res.__('Projects.Form.edit_title'), project });
  });
};

// Update project
exports.update = (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const userId = req.session.user.id;

  db.run(`UPDATE projects SET title = ?, description = ? WHERE id = ? AND user_id = ?`,
    [title, description, id, userId],
    (err) => {
      if (err) return res.sendStatus(500);
      res.redirect('/projects');
    });
};

// Delete project
exports.delete = (req, res) => {
  const id = req.params.id;
  const userId = req.session.user.id;

  db.run(`DELETE FROM projects WHERE id = ? AND user_id = ?`, [id, userId], (err) => {
    if (err) return res.sendStatus(500);
    res.redirect('/projects');
  });
};
