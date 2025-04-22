const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// JSON API route (used by quill notes panel)
router.get('/:projectId/json', noteController.listJson);

// Delete must be first and above create and update
router.post('/delete/:id', noteController.delete);      // POST fallback
router.delete('/delete/:id', noteController.delete);    // JS `fetch` DELETE

// Create or update note via AJAX (shared controller)
router.post('/:projectId', noteController.save);        // Create
router.post('/:projectId/:id', noteController.save);    // Update

// Show all notes (optional view)
router.get('/:projectId', noteController.list);

// Form for new note
router.get('/:projectId/new', noteController.form);

// Form for editing a note
router.get('/:projectId/edit/:id', noteController.form);

module.exports = router;
