const db = require('./db');

// Add relationship + its inverse
function addRelationship(characterId, relatedCharacterId, relation, inverseRelation, description = '', callback) {
  // Insert original relationship
  db.run(
    `INSERT INTO character_relationships 
     (character_id, related_character_id, relation, inverse_relation, description) 
     VALUES (?, ?, ?, ?, ?)`,
    [characterId, relatedCharacterId, relation, inverseRelation, description],
    function (err) {
      if (err) return callback(err);

      // Insert inverse relationship if specified
      if (inverseRelation) {
        db.run(
          `INSERT INTO character_relationships 
           (character_id, related_character_id, relation, inverse_relation, description) 
           VALUES (?, ?, ?, ?, ?)`,
          [relatedCharacterId, characterId, inverseRelation, relation, description],
          function (invErr) {
            if (invErr) return callback(invErr);
            callback(null, this.lastID);
          }
        );
      } else {
        callback(null, this.lastID);
      }
    }
  );
}

// Get all relationships for a character
function getRelationships(characterId, callback) {
  db.all(
    `SELECT cr.id, cr.relation, cr.inverse_relation, cr.description, c.name AS related_name, c.id AS related_id
     FROM character_relationships cr
     JOIN characters c ON cr.related_character_id = c.id
     WHERE cr.character_id = ?
     ORDER BY c.name ASC`,
    [characterId],
    callback
  );
}

// Delete a relationship (and optional inverse)
function deleteRelationship(id, callback) {
  // Get relation info
  db.get(`SELECT * FROM character_relationships WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return callback(err || new Error('Relationship not found'));

    // Delete both directions
    db.run(
      `DELETE FROM character_relationships 
       WHERE (character_id = ? AND related_character_id = ?) 
          OR (character_id = ? AND related_character_id = ?)`,
      [row.character_id, row.related_character_id, row.related_character_id, row.character_id],
      callback
    );
  });
}

module.exports = {
  addRelationship,
  getRelationships,
  deleteRelationship
};
