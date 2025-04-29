const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const relationshipController = require('../controllers/relationshipController');

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// Relationships (should be early if routes overlap)
router.get('/:projectId/relationships', relationshipController.view);
router.post('/:projectId/relationships', relationshipController.add);
router.delete('/:projectId/relationships/:id', relationshipController.remove);

// Graph view (HTML page with vis-network)
router.get('/:projectId/relationships/graph-view', relationshipController.graphView);
router.get('/:projectId/relationships/graph', relationshipController.graphJson);

// Character JSON API (for modals)
router.get('/:projectId/json/:id', characterController.json);

// JSON list of characters for sidebar panel
router.get('/:projectId/json-list', characterController.listJson);

// Relationship update
router.post('/:projectId/relationships/update/:id', relationshipController.update);

// Character CRUD
router.delete('/delete/:id', characterController.delete);
router.post('/delete/:id', characterController.delete);
router.get('/:projectId', characterController.list);
router.get('/:projectId/new', characterController.form);
router.get('/:projectId/edit/:id', characterController.form);
router.post('/:projectId', characterController.save);
router.post('/:projectId/:id', characterController.save);

module.exports = router;
