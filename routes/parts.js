const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// JSON list of parts (for sidebar or AJAX)
router.get('/:projectId/json-list', partController.jsonList);

// Full parts management page
router.get('/:projectId', partController.list);

// New part form
router.get('/:projectId/new', partController.form);

// Edit part form
router.get('/:projectId/edit/:id', partController.form);

// Create part
router.post('/:projectId', partController.save);

// Update part
router.post('/:projectId/:id', partController.save);

// Delete part (DELETE and fallback POST)
router.delete('/:id', partController.delete);
router.post('/delete/:id', partController.delete);

module.exports = router;
