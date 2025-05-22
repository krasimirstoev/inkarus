const express = require('express');
const router  = express.Router();
const c       = require('../controllers/draftController');

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
router.use(isAuthenticated);

// Alias autosave/save without projectId (catch `/drafts/update/:id`)
router.post('/update/:id',   c.update);
router.post('/save/:id',     c.update);

// GET JSON of all parts + their chapters for AJAX
router.get('/:projectId/json-groups',   c.jsonGroups);

// POST create a new chapter
router.post('/:projectId',              c.create);

// POST reorder a chapter within the same part
router.post('/:projectId/reorder/:id',  c.reorder);

// POST move a chapter to another part and set its order
router.post('/:projectId/move/:id',     c.move);

// POST rename a chapter title
router.post('/:projectId/rename/:id',   c.rename);

// DELETE a chapter (with fallback POST)
router.delete('/:projectId/delete/:id', c.delete);
router.post('/:projectId/delete/:id',   c.delete);

// POST autosave or explicit save of chapter content
router.post('/:projectId/update/:id',   c.update);
router.post('/:projectId/save/:id',     c.update);

// GET editor view for a single chapter
router.get('/:projectId/edit/:id',      c.edit);

// GET list view for a project
router.get('/:projectId',               c.list);

module.exports = router;
