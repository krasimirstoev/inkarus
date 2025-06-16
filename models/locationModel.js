// models/locationModel.js - Handles location data operations

const db = require('./db');

/**
 * Get all locations for a project.
 * @param {number} projectId
 * @param {function(Error, Array)} callback
 */
exports.getAll = (projectId, callback) => {
  db.all(
    `SELECT id, project_id, name, type, description, created_at, updated_at
       FROM locations
      WHERE project_id = ?
      ORDER BY created_at DESC`,
    [projectId],
    callback
  );
};

/**
 * Get a single location by its ID.
 * @param {number} id
 * @param {function(Error, Object)} callback
 */
exports.getById = (id, callback) => {
  db.get(
    `SELECT id, project_id, name, type, description, created_at, updated_at
       FROM locations
      WHERE id = ?`,
    [id],
    callback
  );
};

/**
 * Create a new location.
 * @param {number} projectId
 * @param {string} name
 * @param {string} type
 * @param {string} description
 * @param {function(Error, Object)} callback
 */
exports.create = (projectId, name, type, description, callback) => {
  db.run(
    `INSERT INTO locations (project_id, name, type, description)
         VALUES (?, ?, ?, ?)`,
    [projectId, name, type, description],
    function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    }
  );
};

/**
 * Update an existing location.
 * @param {number} id
 * @param {string} name
 * @param {string} type
 * @param {string} description
 * @param {function(Error)} callback
 */
exports.update = (id, name, type, description, callback) => {
  db.run(
    `UPDATE locations
        SET name        = ?,
            type        = ?,
            description = ?,
            updated_at  = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [name, type, description, id],
    callback
  );
};

/**
 * Delete a location.
 * @param {number} id
 * @param {function(Error)} callback
 */
exports.delete = (id, callback) => {
  db.run(
    `DELETE FROM locations WHERE id = ?`,
    [id],
    callback
  );
};
