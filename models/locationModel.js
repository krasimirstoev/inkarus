// models/locationModel.js — Handles location data operations

const db = require('./db');

/**
 * Get all locations for a project,
 * including a computed display_type.
 */
exports.getAll = (projectId, callback) => {
  db.all(
    `SELECT
       id,
       project_id,
       name,
       description,
       type,
       custom_type,
       CASE WHEN type = 'custom' THEN custom_type ELSE type END AS display_type,
       created_at,
       updated_at
     FROM locations
     WHERE project_id = ?
     ORDER BY created_at DESC`,
    [projectId],
    callback
  );
};

/**
 * Get a single location by its ID,
 * including a computed display_type.
 */
exports.getById = (id, callback) => {
  db.get(
    `SELECT
       id,
       project_id,
       name,
       description,
       type,
       custom_type,
       CASE WHEN type = 'custom' THEN custom_type ELSE type END AS display_type,
       created_at,
       updated_at
     FROM locations
     WHERE id = ?`,
    [id],
    callback
  );
};

/**
 * Create a new location.
 *
 * @param {number}   projectId
 * @param {string}   name
 * @param {string}   type
 * @param {string}   customType
 * @param {string}   description
 * @param {function} callback(err, {id})
 */
exports.create = (projectId, name, type, customType, description, callback) => {
  db.run(
    `INSERT INTO locations
       (project_id, name, type, custom_type, description)
     VALUES (?, ?, ?, ?, ?)`,
    [projectId, name, type, customType || '', description],
    function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    }
  );
};

/**
 * Update an existing location.
 *
 * @param {number}   id
 * @param {string}   name
 * @param {string}   type
 * @param {string}   customType
 * @param {string}   description
 * @param {function} callback(err)
 */
exports.update = (id, name, type, customType, description, callback) => {
  db.run(
    `UPDATE locations
        SET name        = ?,
            type        = ?,
            custom_type = ?,
            description = ?,
            updated_at  = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [name, type, customType || '', description, id],
    callback
  );
};

/**
 * Delete a location.
 *
 * @param {number}   id
 * @param {function} callback(err)
 */
exports.delete = (id, callback) => {
  db.run(
    `DELETE FROM locations WHERE id = ?`,
    [id],
    callback
  );
};
