const db = require('../models/db');
const ejs = require('ejs');
const path = require('path');

// List characters for a project (full page)
exports.list = (req, res) => {
  const { projectId } = req.params;
  db.all(
    `SELECT * FROM characters WHERE project_id = ? ORDER BY name`,
    [projectId],
    (err, characters) => {
      if (err) {
        console.error('❌ DB error in characters list:', err);
        return res.sendStatus(500);
      }
      res.render('characters/list', { title: 'Characters', characters, projectId });
    }
  );
};

// Return JSON for a single character (for modals)
exports.json = (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT * FROM characters WHERE id = ?`,
    [id],
    (err, character) => {
      if (err || !character) {
        console.error('❌ Failed to load character JSON:', err || 'Not found');
        return res.json({ success: false });
      }
      res.json({ success: true, character });
    }
  );
};

// ✅ Return JSON list of characters (for sidebar panel / highlighter)
exports.listJson = (req, res) => {
  const { projectId } = req.params;
  db.all(
    `SELECT id, name, pseudonym FROM characters WHERE project_id = ? ORDER BY name`,
    [projectId],
    (err, characters) => {
      if (err) {
        console.error('❌ DB error in listJson:', err);
        return res.json({ success: false });
      }
      res.json({ success: true, characters });
    }
  );
};

// Show form for create/edit
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
      db.all(
        `SELECT id, name FROM characters WHERE project_id = ? ORDER BY name`,
        [projectId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
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
    name, pseudonym, description, health_status, birthdate, gender,
    origin, location, occupation, comment,
    goal, character_type, motivation, fears, weaknesses, arc, secrets, allies, enemies,
    related_character_id, relation,
  } = req.body;

  const redirectTo = `/characters/${projectId}`;

  const handleRelation = characterId => {
    if (related_character_id && relation && characterId) {
      const targetId = parseInt(related_character_id, 10);
      if (targetId === characterId) return;

      db.run(
        `INSERT INTO character_relationships (character_id, related_character_id, relation)
         VALUES (?, ?, ?)`,
        [characterId, targetId, relation],
        err => err && console.error('⚠ Error inserting relation:', err)
      );
      db.run(
        `INSERT INTO character_relationships (character_id, related_character_id, relation)
         VALUES (?, ?, ?)`,
        [targetId, characterId, `related to ${name}`],
        err => err && console.error('⚠ Error inserting reverse relation:', err)
      );
    }
  };

  if (id) {
    // Update
    db.run(
      `UPDATE characters SET
         name = ?, pseudonym = ?, description = ?, health_status = ?, birthdate = ?,
         gender = ?, origin = ?, location = ?, occupation = ?, comment = ?,
         goal = ?, character_type = ?, motivation = ?, fears = ?, weaknesses = ?,
         arc = ?, secrets = ?, allies = ?, enemies = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, pseudonym, description, health_status, birthdate, gender,
        origin, location, occupation, comment,
        goal, character_type, motivation, fears, weaknesses,
        arc, secrets, allies, enemies,
        id,
      ],
      err => {
        if (err) {
          console.error('❌ Update character error:', err);
          return res.sendStatus(500);
        }
        handleRelation(id);
        res.redirect(redirectTo);
      }
    );
  } else {
    // Create
    db.run(
      `INSERT INTO characters (
         project_id, name, pseudonym, description, health_status, birthdate, gender,
         origin, location, occupation, comment, goal, character_type, motivation,
         fears, weaknesses, arc, secrets, allies, enemies
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId, name, pseudonym, description, health_status, birthdate, gender,
        origin, location, occupation, comment,
        goal, character_type, motivation, fears, weaknesses,
        arc, secrets, allies, enemies,
      ],
      function(err) {
        if (err) {
          console.error('❌ Insert character error:', err);
          return res.sendStatus(500);
        }
        handleRelation(this.lastID);
        res.redirect(redirectTo);
      }
    );
  }
};

// Delete a character
exports.delete = (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM characters WHERE id = ?`, [id], err => {
    if (err) {
      console.error('❌ Delete character error:', err);
      return res.sendStatus(500);
    }
    db.run(
      `DELETE FROM character_relationships
       WHERE character_id = ? OR related_character_id = ?`,
      [id, id],
      e => e && console.warn('⚠ Failed to delete relationships for character:', id)
    );
    res.redirect(req.get('Referrer') || '/');
  });
};
