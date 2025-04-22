const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draftController');

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// List drafts for project
router.get('/:projectId', draftController.list);

// Create new draft
router.post('/:projectId', draftController.create);

// Edit specific draft
router.get('/edit/:id', draftController.edit);

// Autosave (update content)
router.post('/update/:id', draftController.update);
router.post('/save/:id', draftController.update); //Alias 

module.exports = router;
