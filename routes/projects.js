const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// List all projects
router.get('/', projectController.list);

// New project form
router.get('/new', projectController.newForm);

// Create new project
router.post('/', projectController.create);

// Show project dashboard
router.get('/:id/dashboard', projectController.dashboard);

// Edit form
router.get('/edit/:id', projectController.editForm);

// Update project
router.post('/:id', projectController.update);

// Delete project
router.delete('/:id', projectController.delete);

module.exports = router;
