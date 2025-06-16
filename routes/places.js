// routes/places.js

const express = require('express');
const router  = express.Router();
const c       = require('../controllers/placeController');

// Middleware: require login
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
router.use(isAuthenticated);

// === AJAX JSON for editor panel ===
router.get('/json/:projectId', c.jsonList);

// === HTML views ===
// List all places for a project
router.get('/:projectId',      c.list);
// Show “new” form
router.get('/:projectId/new',  c.form);
// Show “edit” form
router.get('/:projectId/edit/:id', c.form);

// === Actions ===
// Create
router.post('/:projectId',            c.create);
// Update
router.post('/:projectId/update/:id', c.update);
// Delete
router.delete('/:projectId/delete/:id', c.delete);

module.exports = router;
