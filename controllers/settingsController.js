// controllers/settingsController.js – Handles user preferences

const db = require('../models/db');
const { supportedLanguages } = require('../config/languages');

// Show the settings form (GET)
exports.show = (req, res) => {
  const userId = req.session.user.id;

  db.get(
    'SELECT * FROM preferences WHERE user_id = ?',
    [userId],
    (err, prefs) => {
      if (err) {
        console.error('❌ DB error loading preferences:', err);
        return res.sendStatus(500);
      }

      // Pull flash object from session
      const flashRaw = req.session.flash;
      delete req.session.flash;

      // Translate flash if key is provided
      let flash = null;
      if (flashRaw) {
        // flashRaw.message holds the translation key
        const msg = req.__(flashRaw.message);
        flash = { type: flashRaw.type, message: msg };
      }

      // Load texts under SettingsPage namespace
      const text = req.__('SettingsPage');

      res.render('settings/settings', {
        title:    text.title,
        prefs,
        flash,
        text
      });
    }
  );
};

// Save preferences (POST)
exports.save = (req, res) => {
  const userId = req.session.user.id;
  const {
    autosave_interval,
    show_status_bar,
    font_choice,
    language
  } = req.body;

  const showStatusBar = show_status_bar ? 1 : 0;
  const lang = supportedLanguages.includes(language)
    ? language
    : supportedLanguages[0];

  db.run(
    `
      UPDATE preferences
      SET 
        autosave_interval = ?, 
        show_status_bar    = ?, 
        font_choice        = ?, 
        language           = ?
      WHERE user_id = ?
    `,
    [
      autosave_interval,
      showStatusBar,
      font_choice,
      lang,
      userId
    ],
    (err) => {
      if (err) {
        console.error('❌ DB error updating preferences:', err);
        return res.sendStatus(500);
      }

      // Store the translation key, not the raw text
      req.session.flash = {
        type:    'success',
        message: 'SettingsPage.saved'
      };

      // Redirect so that show() will pick up and translate on the new locale
      res.redirect('/settings');
    }
  );
};
