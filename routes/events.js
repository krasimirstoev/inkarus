// routes/events.js

const express = require('express');
const router  = express.Router();
const c       = require('../controllers/eventController');

// Middleware: require login
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
router.use(isAuthenticated);

// === Timeline view ===
// GET  /events/:projectId
router.get('/:projectId', c.view);

// === AJAX JSON API ===
// GET  /events/json/:projectId
router.get('/json/:projectId',     c.jsonList);
// GET  /events/json/:projectId/:id
router.get('/json/:projectId/:id', c.jsonDetail);

// === Modal form for create/edit ===
// GET  /events/:projectId/new
router.get('/:projectId/new',     c.form);
// GET  /events/:projectId/edit/:id
router.get('/:projectId/edit/:id', c.form);

// === Form submit for create/update ===
// POST /events/:projectId/new
router.post('/:projectId/new',     c.submit);
// POST /events/:projectId/edit/:id
router.post('/:projectId/edit/:id', c.submit);

// === Delete action ===
// DELETE /events/:projectId/delete/:id
router.delete('/:projectId/delete/:id', c.delete);

module.exports = router;
