const express = require('express');
const router = express.Router();
const characterRelationships = require('../controllers/characterRelationships');

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// Show all relationships for a character
router.get('/:projectId/:characterId/relationships', characterRelationships.list);

// Add a relationship
router.post('/:projectId/:characterId/relationships', characterRelationships.add);

// Delete a relationship
router.post('/:projectId/:characterId/relationships/delete/:id', characterRelationships.delete);

module.exports = router;
