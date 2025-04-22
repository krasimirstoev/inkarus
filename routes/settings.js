const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// Preferences form
router.get('/', settingsController.show);

// Save preferences
router.post('/', settingsController.save);

module.exports = router;
