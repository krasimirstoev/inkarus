// routes/items.js - Handles item-related routes for a project

const express = require('express');
const router  = express.Router();
const c       = require('../controllers/itemController');

// Middleware: require login
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
router.use(isAuthenticated);

// === AJAX JSON for editor panel ===
// 1. List of all items for highlighter
router.get('/json/:projectId',         c.jsonList);
// 2. Single item detail for modal
router.get('/json/:projectId/:id',     c.jsonDetail);

// === HTML views ===
// List all items for a project
router.get('/:projectId',              c.list);
// Show “new” form
router.get('/:projectId/new',          c.form);
// Show “edit” form
router.get('/:projectId/edit/:id',     c.form);

// === Actions ===
// Create
router.post('/:projectId',             c.create);
// Update
router.post('/:projectId/update/:id',  c.update);
// Delete
router.delete('/:projectId/delete/:id',c.delete);

module.exports = router;
