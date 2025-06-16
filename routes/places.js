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

// List all places for a project (HTML view)
router.get('/:projectId', c.list);

// JSON list for AJAX (editor panel)
router.get('/json/:projectId', c.jsonList);

// Show “new place” form
router.get('/:projectId/new', c.form);

// Show “edit place” form
router.get('/:projectId/edit/:id', c.form);

// Create a new place
router.post('/:projectId', c.create);

// Update an existing place
router.post('/:projectId/update/:id', c.update);

// Delete a place
router.delete('/:projectId/delete/:id', c.delete);

module.exports = router;