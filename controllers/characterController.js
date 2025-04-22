const db = require('../models/db');

// List characters for a project
exports.list = (req, res) => {
  const { projectId } = req.params;

  db.all(`SELECT * FROM characters WHERE project_id = ? ORDER BY name`, [projectId], (err, characters) => {
    if (err) {
      console.error('❌ DB error in characters list:', err);
      return res.sendStatus(500);
    }

    res.render('characters/list', { title: 'Characters', characters, projectId });
  });
};

// Form for create/edit
exports.form = (req, res) => {
  const { projectId, id } = req.params;

  const fetchCharacter = () =>
    id
      ? new Promise((resolve, reject) => {
          db.get(`SELECT * FROM characters WHERE id = ?`, [id], (err, character) => {
            if (err || !character) reject(err || new Error('Not found'));
            else resolve(character);
          });
        })
      : Promise.resolve(null);

  const fetchOthers = () =>
    new Promise((resolve, reject) => {
      db.all(`SELECT id, name FROM characters WHERE project_id = ?`, [projectId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

  Promise.all([fetchCharacter(), fetchOthers()])
    .then(([character, allCharacters]) => {
      res.render('characters/form', {
        title: character ? 'Edit Character' : 'New Character',
        character,
        allCharacters,
        projectId,
      });
    })
    .catch(err => {
      console.error('❌ Character form error:', err);
      res.sendStatus(500);
    });
};

// Save (create or update)
exports.save = (req, res) => {
  const { projectId, id } = req.params;
  const {
    name,
    pseudonym,
    description,
    health_status,
    birthdate,
    gender,
    origin,
    location,
    occupation,
    comment,
    related_character_id,
    relation,
  } = req.body;

  const redirectTo = `/characters/${projectId}`;

  const handleRelation = (characterId) => {
    if (related_character_id && relation && characterId) {
      const targetId = parseInt(related_character_id, 10);
      if (targetId === characterId) return;

      db.run(
        `INSERT INTO character_relationships (character_id, related_character_id, relation) VALUES (?, ?, ?)`,
        [characterId, targetId, relation],
        function (err) {
          if (err) return console.error('⚠ Error inserting relation:', err);
        }
      );
      db.run(
        `INSERT INTO character_relationships (character_id, related_character_id, relation) VALUES (?, ?, ?)`,
        [targetId, characterId, `related to ${name}`],
        function (err) {
          if (err) return console.error('⚠ Error inserting reverse relation:', err);
        }
      );
    }
  };

  if (id) {
    db.run(
      `UPDATE characters SET name = ?, pseudonym = ?, description = ?, health_status = ?, birthdate = ?, gender = ?, origin = ?, location = ?, occupation = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, pseudonym, description, health_status, birthdate, gender, origin, location, occupation, comment, id],
      function (err) {
        if (err) {
          console.error('❌ Update character error:', err);
          return res.sendStatus(500);
        }

        handleRelation(id);
        res.redirect(redirectTo);
      }
    );
  } else {
    db.run(
      `INSERT INTO characters (project_id, name, pseudonym, description, health_status, birthdate, gender, origin, location, occupation, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, name, pseudonym, description, health_status, birthdate, gender, origin, location, occupation, comment],
      function (err) {
        if (err) {
          console.error('❌ Insert character error:', err);
          return res.sendStatus(500);
        }

        const newId = this.lastID;
        handleRelation(newId);
        res.redirect(redirectTo);
      }
    );
  }
};

// Delete
exports.delete = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM characters WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('❌ Delete character error:', err);
      return res.sendStatus(500);
    }

    db.run(
      `DELETE FROM character_relationships WHERE character_id = ? OR related_character_id = ?`,
      [id, id],
      err2 => {
        if (err2) console.warn('⚠ Failed to delete relationships for character:', id);
      }
    );

    res.redirect(req.get('Referrer') || '/');
  });
};

// Return JSON for a single character
exports.json = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM characters WHERE id = ?`, [id], (err, character) => {
    if (err || !character) {
      console.error('❌ Failed to load character JSON:', err || 'Not found');
      return res.json({ success: false });
    }

    res.json({ success: true, character });
  });
};
