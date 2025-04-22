const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

router.use(isAuthenticated);

// Search route
router.get('/', searchController.search);

module.exports = router;
