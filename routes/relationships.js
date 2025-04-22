const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationshipController');

// Middleware for login
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// Character relationship routes
router.get('/:projectId', relationshipController.view);
router.post('/:projectId', relationshipController.add);
router.delete('/:projectId/:id', relationshipController.remove);
router.get('/:projectId/graph', relationshipController.graphJson);

module.exports = router;
