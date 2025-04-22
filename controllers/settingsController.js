const db = require('../models/db');

// Show user preferences form
exports.show = (req, res) => {
  const userId = req.session.user.id;

  db.get(`SELECT * FROM preferences WHERE user_id = ?`, [userId], (err, prefs) => {
    if (err) return res.sendStatus(500);
    res.render('settings/preferences', { title: 'Preferences', prefs });
  });
};

// Save preferences
exports.save = (req, res) => {
  const userId = req.session.user.id;
  const { autosave_interval, show_status_bar, font_choice } = req.body;

  db.run(`UPDATE preferences 
          SET autosave_interval = ?, 
              show_status_bar = ?, 
              font_choice = ? 
          WHERE user_id = ?`,
    [autosave_interval, show_status_bar ? 1 : 0, font_choice, userId],
    (err) => {
      if (err) return res.sendStatus(500);
      res.redirect('/settings');
    });
};
