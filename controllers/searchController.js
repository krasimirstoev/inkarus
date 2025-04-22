const db = require('../models/db');

// Perform global search
exports.search = (req, res) => {
  const userId = req.session.user.id;
  const query = `%${req.query.q}%`;

  // Search in drafts, notes, and characters
  const results = {
    drafts: [],
    notes: [],
    characters: []
  };

  db.all(`SELECT d.*, p.title as project_title 
          FROM drafts d 
          JOIN projects p ON d.project_id = p.id 
          WHERE p.user_id = ? AND (d.title LIKE ? OR d.content LIKE ?)`,
    [userId, query, query], (err, drafts) => {
      if (!err && drafts) results.drafts = drafts;

      db.all(`SELECT n.*, p.title as project_title 
              FROM notes n 
              JOIN projects p ON n.project_id = p.id 
              WHERE p.user_id = ? AND (n.title LIKE ? OR n.content LIKE ?)`,
        [userId, query, query], (err, notes) => {
          if (!err && notes) results.notes = notes;

          db.all(`SELECT c.*, p.title as project_title 
                  FROM characters c 
                  JOIN projects p ON c.project_id = p.id 
                  WHERE p.user_id = ? AND (c.name LIKE ? OR c.description LIKE ?)`,
            [userId, query, query], (err, characters) => {
              if (!err && characters) results.characters = characters;

              res.render('search/results', {
                title: 'Search Results',
                query: req.query.q,
                results
              });
            });
        });
    });
};
