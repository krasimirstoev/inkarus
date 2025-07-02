const db = require('./db');

/**
 * Add a single relationship record between two characters.
 *
 * @param {number}   characterId
 * @param {number}   relatedCharacterId
 * @param {string}   relation
 * @param {function} callback(err, lastID)
 */
function addRelationship(characterId, relatedCharacterId, relation, callback) {
  const sql = `
    INSERT INTO character_relationships
      (character_id, related_character_id, relation)
    VALUES (?, ?, ?)
  `;
  db.run(sql, [characterId, relatedCharacterId, relation], function(err) {
    if (err) return callback(err);
    // return the new record’s ID
    callback(null, this.lastID);
  });
}

/**
 * Get all relationships for a given character.
 *
 * @param {number}   characterId
 * @param {function} callback(err, rows)
 */
function getRelationships(characterId, callback) {
  const sql = `
    SELECT
      cr.id,
      cr.relation,
      c.id   AS related_id,
      c.name AS related_name
    FROM character_relationships AS cr
    JOIN characters AS c
      ON cr.related_character_id = c.id
    WHERE cr.character_id = ?
    ORDER BY c.name ASC
  `;
  db.all(sql, [characterId], callback);
}

/**
 * Delete a relationship (both directions).
 *
 * @param {number}   id
 * @param {function} callback(err)
 */
function deleteRelationship(id, callback) {
  // First fetch the row to know both character IDs
  db.get(
    `SELECT character_id, related_character_id
       FROM character_relationships
      WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error('Relationship not found'));

      const { character_id, related_character_id } = row;
      // Delete any record linking these two in either direction
      const sql = `
        DELETE FROM character_relationships
         WHERE (character_id = ? AND related_character_id = ?)
            OR (character_id = ? AND related_character_id = ?)
      `;
      db.run(
        sql,
        [character_id, related_character_id, related_character_id, character_id],
        callback
      );
    }
  );
}

module.exports = {
  addRelationship,
  getRelationships,
  deleteRelationship
};
