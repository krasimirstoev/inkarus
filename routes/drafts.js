const express = require('express');
const router  = express.Router();
const c       = require('../controllers/draftController');
const db      = require('../models/db');

// Middleware: require login
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
router.use(isAuthenticated);


// GET JSON list of revisions for a given draft
router.get('/:projectId/revisions/:draftId', c.revisionsJson);


/**
 * POST restore a specific revision to its draft
 */
router.post('/:projectId/restore/:revisionId', (req, res) => {
  const { revisionId } = req.params;

  db.get(`SELECT draft_id, content FROM draft_revisions WHERE id = ?`, [revisionId], (err, row) => {
    if (err || !row) {
      console.error('❌ Revision not found or DB error:', err);
      return res.status(404).json({ success: false, message: 'Revision not found' });
    }

    db.run(
      `UPDATE drafts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [row.content, row.draft_id],
      err2 => {
        if (err2) {
          console.error('❌ Failed to restore revision:', err2);
          return res.status(500).json({ success: false, message: 'Restore failed' });
        }

        res.json({ success: true });
      }
    );
  });
});

// DELETE a specific revision
router.delete('/:projectId/revision/:revisionId', (req, res) => {
  const { revisionId } = req.params;
  db.run(`DELETE FROM draft_revisions WHERE id = ?`, [revisionId], err => {
    if (err) {
      console.error('❌ Failed to delete revision:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});


// Save or autosave
router.post('/update/:id',             c.update);
router.post('/save/:id',               c.update);
router.post('/:projectId/update/:id',  c.update);
router.post('/:projectId/save/:id',    c.update);

// Get JSON groups
router.get('/:projectId/json-groups',  c.jsonGroups);

// Create draft
router.post('/:projectId',             c.create);

// Reorder or move draft
router.post('/:projectId/reorder/:id', c.reorder);
router.post('/:projectId/move/:id',    c.move);

// Rename or delete draft
router.post('/:projectId/rename/:id',  c.rename);
router.delete('/:projectId/delete/:id', c.delete);
router.post('/:projectId/delete/:id',   c.delete);

// Views
router.get('/:projectId/edit/:id',     c.edit);
router.get('/:projectId',              c.list);

module.exports = router;
