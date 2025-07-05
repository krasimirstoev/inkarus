// routes/settings.js – Handles user preferences routes

const express = require('express');
const router  = express.Router();
const c       = require('../controllers/settingsController');

// Middleware: require login
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
router.use(isAuthenticated);

// === JSON API for frontend ===
// Return only the autosave interval (in minutes)
router.get('/api', (req, res) => {
  const interval = req.userPrefs?.autosave_interval || 2;
  res.json({ autosave_interval: interval });
});

// === HTML view ===
// Show settings form
router.get('/', c.show);

// === Actions ===
// Save preferences
router.post('/', c.save);

module.exports = router;
