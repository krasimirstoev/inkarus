// routes/parts.js
const express = require('express');
const router  = express.Router();
const c       = require('../controllers/partController');

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
router.use(isAuthenticated);

/**
 * AJAX: JSON list of parts
 *   GET /parts/:projectId/json-list
 */
router.get('/:projectId/json-list', c.jsonList);

/**
 * AJAX: load only the form partial (no layout)
 *   GET /parts/:projectId/modal/form       → new‐part form
 *   GET /parts/:projectId/modal/form/:id   → edit‐part form
 */
router.get('/:projectId/modal/form',       c.modalForm);
router.get('/:projectId/modal/form/:id',   c.modalForm);

/**
 * Standard CRUD pages (full‐page)
 */
router.get('/:projectId',       c.list);           // list page
router.get('/:projectId/new',   c.form);           // full “new” page
router.get('/:projectId/edit/:id', c.form);        // full “edit” page

/**
 * Create / Update
 */
router.post('/:projectId',         c.save);        // create
router.post('/:projectId/:id',     c.save);        // update

/**
 * Delete (AJAX via DELETE, or fallback via POST)
 *   DELETE /parts/:projectId/:id
 *   POST   /parts/:projectId/:id/delete
 */
router.delete('/:projectId/:id',        c.delete);
router.post('/:projectId/:id/delete',   c.delete);

module.exports = router;
